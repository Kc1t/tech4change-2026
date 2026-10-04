import { startCloudEar, type CloudEar } from '../eilo/cloud-ear'
import { freeWordRungs, safeRungs, type Rung } from '../eilo/guess-safety'
import { buildLadder, deterministicPlan, PHONOLOGICAL_CONFIDENCE_GATE, resolve } from '../eilo/ladder'
import { CONFIDENCE_FLOOR, normalise, predict, type Prediction } from '../eilo/predict'
import { asksForWord, BLOCK_TIMING, closesThought, judgedStall, stallDecision, struggleOf } from '../eilo/stall'
import { maskOffensive } from '../eilo/text-safety'
import type { CuePlan, GraphNode, Guess, HelpCall, LadderStep, NodeId } from '../eilo/types'
import type { Voice } from '../eilo/voice'
import { BrowserEar, browserSpeechSupported } from './browser-ear'
import { lifeGraph, SCRIPTED_TARGET, THRESHOLDS, TIMING, WORD_COUNTS } from './config'
import { GuessAhead } from './guess-ahead'
import { HelpSession, type TargetSource } from './help-session'
import { ModelClient, networkOf, warmRoutes, type Reply, type Timed } from './model-client'
import { SIMULATION } from './simulation'
import { countMentions, greetingEnd, labelsOf, lastWords, namesOf, reachesFor, wordsFrom } from './text'
import { TranscriptBuffer } from './transcript'
import { IDLE_CUE, INITIAL_STATE, type Activity, type CueOrigin, type CuePhase, type DemoCue, type DemoGuess, type LiveDemoState, type Network } from './types'

export type EngineCallbacks = {
  onState: (state: LiveDemoState) => void
  onCue: (cue: DemoCue) => void
}

export type EngineOptions = { listen: boolean; wakeWord?: boolean }

const GREETING = 'Oi! Pode falar.'

const graph = lifeGraph

function rungsFor(node: GraphNode, ladder: LadderStep[], confidence: number): Rung[] {
  return safeRungs(labelsOf(node), node.label, ladder, confidence)
}

function freeNode(word: string): GraphNode {
  return { id: `free:${normalise(word)}`, label: word, kind: 'object', attrs: {}, layout: { x: 0, y: 0 } }
}

function hiddenGuess(guess: DemoGuess): DemoGuess {
  return { ...guess, word: '', alternatives: [], revealed: false }
}

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function wantsWord(help: HelpCall | null | undefined, frustration: number | undefined): boolean {
  return help === 'word' && (frustration ?? 0) >= THRESHOLDS.wordFrustration
}

function within<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return Promise.race([promise, new Promise<undefined>(resolve => window.setTimeout(() => resolve(undefined), ms))])
}

export class DemoEngine {
  private state: LiveDemoState = INITIAL_STATE
  private readonly transcript = new TranscriptBuffer()
  private readonly client = new ModelClient(graph, reply => this.noteReply(reply))
  private readonly ahead = new GuessAhead(text => this.client.guess(text, { judge: true }), TIMING.aheadRetryMs)
  private readonly browserEar = new BrowserEar({
    onResult: (finals, interim) => this.onBrowserResult(finals, interim),
    onBlocked: () => {
      if (!this.cloudEar) this.setMic('blocked')
    },
    onUnavailable: () => {
      if (!this.cloudEar) this.setMic('off')
    }
  })
  private cloudEar: CloudEar | null = null
  private voice: Voice | null = null
  private unsubscribeVoice: (() => void) | null = null

  private running = false
  private awake: boolean
  private waitingForModel = false
  private cloudStarting = false
  private browserListening = false
  private tickTimer: number | null = null
  private retryTimer: number | null = null
  private idleTimer: number | null = null
  private simulationTimers: number[] = []
  private simulating = false

  private session: HelpSession | null = null
  private epoch = 0
  private phase: CuePhase = 'idle'
  private network: Network = 'online'
  private guess: DemoGuess | null = null
  private readonly recall = new Map<NodeId, number>()
  private spokenKey = ''
  private judging = false
  private outcome: { at: number; words: number } | null = null
  private lastSpeechAt = 0
  private segment: { startedAt: number | null; wordMark: number; handled: boolean } = { startedAt: null, wordMark: 0, handled: false }
  private shownFrom = 0
  private blockEndedAt = -Infinity
  private deafUntil = 0

  constructor(
    private readonly callbacks: EngineCallbacks,
    private readonly options: EngineOptions = { listen: true }
  ) {
    this.awake = !options.wakeWord
  }

  readonly start = () => {
    if (this.running) return
    this.running = true
    warmRoutes()
    this.voice?.prefetch(graph.nodes[SCRIPTED_TARGET]?.label ?? '')
    window.addEventListener('online', this.onOnline)
    window.addEventListener('offline', this.onOffline)
    if (navigator.onLine === false) this.onOffline()
    if (this.options.listen) {
      if (!isMobile() || !browserSpeechSupported()) this.startBrowserEar()
      this.startCloudEar()
    }
    this.tickTimer = window.setInterval(this.tick, TIMING.tickMs)
  }

  readonly stop = () => {
    if (!this.running) return
    this.running = false
    if (this.tickTimer !== null) window.clearInterval(this.tickTimer)
    if (this.retryTimer !== null) window.clearTimeout(this.retryTimer)
    this.tickTimer = null
    this.retryTimer = null
    window.removeEventListener('online', this.onOnline)
    window.removeEventListener('offline', this.onOffline)
    this.cloudEar?.stop()
    this.cloudEar = null
    this.browserEar.stop()
    this.browserListening = false
    this.client.cancelAll()
    this.clearSimulation()
    this.clearIdleTimer()
  }

  readonly setVoice = (voice: Voice | null) => {
    if (voice === this.voice) return
    this.unsubscribeVoice?.()
    this.unsubscribeVoice = null
    this.voice = voice
    if (!voice) return
    let wasSpeaking = voice.speaking()
    this.unsubscribeVoice = voice.subscribe(() => {
      const speaking = voice.speaking()
      if (speaking === wasSpeaking) return
      wasSpeaking = speaking
      this.cloudEar?.mute(speaking)
      this.deafUntil = speaking ? Infinity : performance.now() + TIMING.deafTailMs
    })
  }

  readonly micLevel = () => this.cloudEar?.level() ?? 0

  readonly wake = (mark = this.transcript.wordCount, greet = true) => {
    if (this.awake || !this.running) return
    this.awake = true
    const after = wordsFrom(this.transcript.text, mark).split(' ').filter(Boolean)
    this.shownFrom = mark
    this.segment = { startedAt: after.length > 0 ? this.lastSpeechAt : null, wordMark: mark, handled: false }
    this.patch({ words: after.slice(-WORD_COUNTS.visible).map(maskOffensive), activity: this.activityAt(performance.now()) })
    if (greet) void this.voice?.say(GREETING)
  }

  readonly giveWord = () => {
    const session = this.session
    if (session && this.awake && this.phase === 'cue') this.showLevel(session.wordLevel)
  }

  readonly nextLevel = () => {
    if (!this.awake) return
    const session = this.session
    if (!session) {
      this.startHelp()
      return
    }
    if (this.phase !== 'cue' || performance.now() - session.lastCueAt < TIMING.minCueGapMs) return
    this.showLevel(Math.min(session.level + 1, session.wordLevel))
  }

  readonly reset = () => {
    this.voice?.stop()
    this.client.cancelAll()
    this.transcript.reset()
    this.deafUntil = 0
    this.segment = { startedAt: null, wordMark: 0, handled: false }
    this.shownFrom = 0
    this.epoch += 1
    this.recall.clear()
    this.guess = null
    this.ahead.reset()
    this.clearSimulation()
    this.clearIdleTimer()
    const wasSimulating = this.simulating
    this.simulating = false
    const listening = this.browserListening || this.cloudEar !== null
    this.patch({ words: [], guess: null, mic: wasSimulating ? (listening ? 'listening' : 'off') : this.state.mic })
    this.backToIdle()
    this.blockEndedAt = -Infinity
    this.awake = !this.options.wakeWord
  }

  readonly simulate = () => {
    this.reset()
    this.awake = true
    this.simulating = true
    this.patch({ mic: 'simulating' })
    let spoken = ''
    this.simulationTimers = SIMULATION.map(step =>
      window.setTimeout(() => {
        if (step.final) {
          spoken = `${spoken} ${step.text}`.trim()
          this.hear(spoken, '')
        } else {
          this.hear(spoken, step.text)
        }
      }, step.at)
    )
    const end = SIMULATION[SIMULATION.length - 1].at + TIMING.resultHoldMs + 500
    this.simulationTimers.push(
      window.setTimeout(() => {
        this.simulating = false
        this.transcript.set('', '')
        this.setMic(this.browserListening || this.cloudEar ? 'listening' : 'off')
      }, end)
    )
  }

  private patch(next: Partial<LiveDemoState>) {
    this.state = { ...this.state, ...next }
    this.callbacks.onState(this.state)
  }

  private setMic(mic: LiveDemoState['mic']) {
    if (this.simulating || this.state.mic === mic) return
    this.patch({ mic })
  }

  private visibleGuess(): DemoGuess | null {
    const revealed = this.phase === 'given' || this.phase === 'success'
    return this.guess ? (revealed ? { ...this.guess, revealed: true } : hiddenGuess(this.guess)) : null
  }

  private publish(cue: DemoCue, next: Partial<LiveDemoState> = {}) {
    this.phase = cue.phase
    if (cue.phase === 'success' || cue.phase === 'given') this.outcome ??= { at: performance.now(), words: this.transcript.wordCount }
    this.patch({ ...next, cue, guess: this.visibleGuess(), activity: this.activityAt(performance.now()) })
    this.callbacks.onCue(cue)
  }

  private showGuess(guess: DemoGuess | null) {
    this.guess = guess
    this.patch({ guess: this.visibleGuess() })
  }

  private noteReply(reply: Reply) {
    const next = networkOf(reply)
    if (next) this.setNetwork(next)
  }

  private setNetwork(next: Network) {
    if (next === this.network) return
    this.network = next
    const cue = this.state.cue.phase === 'idle' ? this.state.cue : { ...this.state.cue, network: next }
    this.patch({ network: next, cue })
  }

  private clearIdleTimer() {
    if (this.idleTimer !== null) window.clearTimeout(this.idleTimer)
    this.idleTimer = null
  }

  private clearSimulation() {
    this.simulationTimers.forEach(timer => window.clearTimeout(timer))
    this.simulationTimers = []
  }

  private scheduleIdle() {
    this.clearIdleTimer()
    this.idleTimer = window.setTimeout(() => this.backToIdle(), TIMING.resultHoldMs)
  }

  private backToIdle() {
    if (this.session) this.blockEndedAt = performance.now()
    const outcome = this.outcome
    this.outcome = null
    const spokeSince = outcome !== null && this.lastSpeechAt > outcome.at + TIMING.outcomeEchoMs
    this.shownFrom = spokeSince ? outcome.words : this.transcript.wordCount
    this.session = null
    this.segment = spokeSince
      ? { startedAt: outcome.at, wordMark: outcome.words, handled: false }
      : { startedAt: null, wordMark: this.segment.wordMark, handled: true }
    const words = wordsFrom(this.transcript.text, this.shownFrom).split(' ').filter(Boolean).slice(-WORD_COUNTS.visible).map(maskOffensive)
    this.publish(IDLE_CUE, { words })
  }

  private aimAt(node: GraphNode, ladder: LadderStep[], rungs: Rung[], origin: CueOrigin, targetBy: TargetSource) {
    this.voice?.prefetch(node.label)
    this.prefetchRungs(rungs)
    return { target: node, ladder, rungs, origin, targetBy, baseline: countMentions(this.transcript.text, namesOf(node)), wordMark: this.transcript.wordCount }
  }

  private prefetchRungs(rungs: Rung[]) {
    rungs.slice(0, -1).forEach(rung => this.voice?.prefetch(rung.text))
  }

  private openSession(node: GraphNode, ladder: LadderStep[], rungs: Rung[], origin: CueOrigin, targetBy: TargetSource, confidence: number): HelpSession {
    this.epoch += 1
    this.session = new HelpSession(this.aimAt(node, ladder, rungs, origin, targetBy), confidence)
    return this.session
  }

  private showLevel(level: number) {
    const session = this.session
    if (!session) return
    session.level = level
    session.lastCueAt = performance.now()
    session.cueWordMark = this.transcript.wordCount
    session.verdict = null
    session.assessedText = ''
    const cue = session.cueAt(level, this.network)
    if (cue.phase === 'given') {
      this.recall.set(session.target.id, level)
      this.scheduleIdle()
    }
    this.publish(cue)
    const key = `${this.epoch}-${session.target.id}-${level}`
    if (this.voice && this.spokenKey !== key) {
      this.spokenKey = key
      void this.voice.say(cue.text)
    }
  }

  private republishCue() {
    const session = this.session
    if (!session || this.phase !== 'cue') return
    session.level = Math.min(session.level, session.lastHintLevel)
    this.publish(session.cueAt(session.level, this.network))
  }

  private applyPlan(session: HelpSession, node: GraphNode, ranked: Timed<CuePlan> | null) {
    if (!ranked || this.session !== session || session.target.id !== node.id || ranked.value.targetId !== node.id || this.phase !== 'cue') return
    const ladder = resolve(graph, { ...ranked.value, confidence: 1 })
    const rungs = rungsFor(node, ladder, session.confidence)
    if (rungs.length < 2) return
    session.ladder = ladder
    session.rungs = rungs
    this.prefetchRungs(rungs)
    session.origin = ranked.value.origin
    this.patch({ latency: { ...this.state.latency, cue: ranked.ms } })
    this.republishCue()
  }

  private raiseConfidence(session: HelpSession, confidence: number) {
    const before = session.confidence
    session.confidence = Math.max(before, confidence)
    const crossed = before < PHONOLOGICAL_CONFIDENCE_GATE && session.confidence >= PHONOLOGICAL_CONFIDENCE_GATE
    if (!crossed || this.phase !== 'cue' || this.session !== session) return
    session.rungs = rungsFor(session.target, session.ladder, session.confidence)
    this.prefetchRungs(session.rungs)
  }

  private rankLater(session: HelpSession, node: GraphNode, mentioned: NodeId[], last: number | null) {
    void this.client.plan(node.id, mentioned, last).then(ranked => this.applyPlan(session, node, ranked))
  }

  private async refine(session: HelpSession, prediction: Prediction) {
    const first = session.target
    const lastFor = (id: NodeId) => this.recall.get(id) ?? null
    this.rankLater(session, first, prediction.mentioned, lastFor(first.id))
    if (this.cloudEar && !this.simulating) await this.cloudEar.settle(TIMING.settleMs)
    if (this.session !== session) return
    const completed = await this.ahead.request(lastWords(this.transcript.text, WORD_COUNTS.recent))
    if (!completed || this.session !== session) return
    const guess = completed.value
    this.showGuess({ word: guess.word, confidence: guess.confidence, alternatives: guess.alternatives.map(alt => alt.word), origin: 'openrouter', inGraph: guess.nodeId !== null })
    session.addCandidates([guess.word, ...guess.alternatives.map(alt => alt.word)].filter(word => !namesOf(first).includes(normalise(word))), this.transcript.text)
    this.patch({ latency: { ...this.state.latency, complete: completed.ms } })

    const untouched = this.phase === 'cue' && session.level === session.startLevel
    if (guess.nodeId === first.id) {
      session.targetBy = 'openrouter'
      this.raiseConfidence(session, guess.confidence)
      this.republishCue()
      return
    }
    if (!untouched) return

    const node = guess.nodeId ? graph.nodes[guess.nodeId] : undefined
    if (node) {
      const ladder = buildLadder(graph, deterministicPlan(graph, node.id))
      const rungs = rungsFor(node, ladder, guess.confidence)
      if (rungs.length < 2) return
      session.confidence = guess.confidence
      session.retarget(this.aimAt(node, ladder, rungs, 'offline', 'openrouter'))
      const last = lastFor(node.id)
      session.startLevel = session.startLevelFor(last)
      this.showLevel(session.startLevel)
      this.applyPlan(session, node, await this.client.plan(node.id, [...prediction.mentioned, node.id], last))
      return
    }
    const alreadySaid = countMentions(lastWords(this.transcript.text, WORD_COUNTS.recent), [normalise(guess.word)]) > 0
    if (alreadySaid || guess.confidence < THRESHOLDS.freeWordConfidence || guess.cues.length === 0) return
    const rungs = freeWordRungs(guess)
    if (rungs.length < 2) return
    session.confidence = guess.confidence
    session.retarget(this.aimAt(freeNode(guess.word), [], rungs, 'openrouter', 'openrouter'))
    session.startLevel = 0
    this.showLevel(0)
  }

  private startFromGuess(completed: Timed<Guess>): boolean {
    const guess = completed.value
    const graphNode = guess.nodeId ? graph.nodes[guess.nodeId] : undefined
    const node = graphNode ?? freeNode(guess.word)
    const recent = lastWords(this.transcript.text, WORD_COUNTS.recent)
    if (countMentions(recent, namesOf(node)) > 0) return false
    if (!graphNode && (guess.confidence < THRESHOLDS.freeWordConfidence || guess.cues.length === 0)) return false
    const ladder = graphNode ? buildLadder(graph, deterministicPlan(graph, graphNode.id)) : []
    const rungs = graphNode ? rungsFor(graphNode, ladder, guess.confidence) : freeWordRungs(guess)
    if (rungs.length < 2) return false
    const previous = this.session?.target ?? null
    const session = this.openSession(node, ladder, rungs, graphNode ? 'offline' : 'openrouter', 'openrouter', guess.confidence)
    session.addCandidates([...guess.alternatives.map(alt => alt.word), ...(previous ? [previous.label] : [])], this.transcript.text)
    this.guess = { word: guess.word, confidence: guess.confidence, alternatives: guess.alternatives.map(alt => alt.word), origin: 'openrouter', inGraph: Boolean(graphNode) }
    this.patch({ latency: { ...this.state.latency, complete: completed.ms } })
    const last = this.recall.get(node.id) ?? null
    session.startLevel = session.startLevelFor(last)
    const spoken = struggleOf(wordsFrom(this.transcript.text, this.segment.wordMark)).frustration
    session.openingStruggle = Math.min(Math.max(guess.frustration ?? 0, spoken), THRESHOLDS.openingFrustrationCap)
    this.showLevel(session.startLevel)
    if (graphNode) this.rankLater(session, graphNode, [...predict(graph, recent).mentioned, graphNode.id], last)
    return true
  }

  private async awaitGuess(text: string, needsStall: boolean) {
    if (this.judging) return
    this.judging = true
    const epoch = this.epoch
    const spokeAt = this.lastSpeechAt
    const completed = await this.ahead.request(text)
    this.judging = false
    if (!completed || this.epoch !== epoch || this.session || this.phase !== 'idle') return
    if (this.lastSpeechAt !== spokeAt || (needsStall && !judgedStall(completed.value))) return
    this.startFromGuess(completed)
  }

  private startHelp() {
    if (this.session || this.phase !== 'idle') return
    const text = lastWords(this.transcript.text, WORD_COUNTS.recent)
    if (!text.trim()) return
    const ready = this.ahead.resultFor(text)
    if (ready && this.startFromGuess(ready)) return
    if (ready === undefined && this.network === 'online') void this.startWhenModelAnswers(text)
    else this.startFromGraph(text)
  }

  private async startWhenModelAnswers(text: string) {
    if (this.waitingForModel) return
    this.waitingForModel = true
    const epoch = this.epoch
    const completed = await within(this.ahead.request(text), TIMING.modelFirstMs)
    this.waitingForModel = false
    if (!this.running || this.epoch !== epoch || this.session || this.phase !== 'idle') return
    if (completed && this.startFromGuess(completed)) return
    this.startFromGraph(text)
  }

  private startFromGraph(text: string) {
    const prediction = predict(graph, wordsFrom(this.transcript.text, this.shownFrom))
    const targetId = prediction.targetId
    const node = targetId && prediction.confidence >= CONFIDENCE_FLOOR ? graph.nodes[targetId] : undefined
    const ladder = node ? buildLadder(graph, deterministicPlan(graph, node.id)) : []
    const rungs = node ? rungsFor(node, ladder, prediction.confidence) : []
    if (!targetId || !node || rungs.length < 2) {
      void this.awaitGuess(text, false)
      return
    }
    const session = this.openSession(node, ladder, rungs, 'offline', 'offline', prediction.confidence)
    this.guess = {
      word: node.label,
      confidence: prediction.confidence,
      alternatives: prediction.alternatives.map(id => graph.nodes[id]?.label).filter((label): label is string => Boolean(label)),
      origin: 'offline',
      inGraph: true
    }
    session.addCandidates(this.guess.alternatives, this.transcript.text)
    session.startLevel = session.startLevelFor(this.recall.get(targetId))
    session.openingStruggle = Math.min(struggleOf(wordsFrom(this.transcript.text, this.segment.wordMark)).frustration, THRESHOLDS.openingFrustrationCap)
    this.showLevel(session.startLevel)
    void this.refine(session, prediction)
  }

  private escalate() {
    const session = this.session
    if (!session || this.phase !== 'cue') return
    this.showLevel(session.strongestLevel())
  }

  private resolveWith(word: string, recalled: GraphNode | null) {
    const session = this.session
    if (!session) return
    if (recalled) this.recall.set(recalled.id, session.level)
    this.publish({ phase: 'success', level: session.level, total: session.rungs.length, text: word, origin: session.origin, targetBy: session.targetBy, network: this.network })
    this.scheduleIdle()
  }

  private async assessStruggle(session: HelpSession) {
    session.assessing = true
    const level = session.level
    const target = session.target
    const after = wordsFrom(this.transcript.text, session.wordMark)
    const completed = await this.client.guess(lastWords(this.transcript.text, WORD_COUNTS.recent), { judge: true, hint: session.rungs[level]?.text ?? null, after, current: target.label })
    session.assessing = false
    if (!completed || this.session !== session || session.level !== level || this.phase !== 'cue') return
    const guess = completed.value
    session.verdict = { frustration: guess.frustration ?? 0, help: guess.help ?? null, stalled: guess.stalled }
    if (namesOf(target).includes(normalise(guess.word))) return
    const calm = !guess.stalled && guess.help === 'wait' && (guess.frustration ?? 0) < THRESHOLDS.calmFrustration
    if (calm && countMentions(after, [normalise(guess.word)]) > 0) {
      this.resolveWith(guess.word, null)
      return
    }
    if (guess.stalled && guess.confidence >= THRESHOLDS.retargetConfidence) this.startFromGuess(completed)
  }

  private checkSuccess() {
    const session = this.session
    if (!session || this.phase !== 'cue') return
    const spoken = this.transcript.text
    if (countMentions(spoken, namesOf(session.target)) > session.baseline) {
      this.resolveWith(session.target.label, session.target)
      return
    }
    const own = session.candidateSaid(spoken)
    if (own) this.resolveWith(own, null)
  }

  private markVoice(now: number) {
    if (this.segment.startedAt === null || now - this.lastSpeechAt > TIMING.segmentGapMs) {
      this.segment = { startedAt: now, wordMark: this.transcript.wordCount, handled: false }
    }
    this.lastSpeechAt = now
  }

  private setText(finalText: string, interim: string) {
    this.transcript.set(finalText, interim)
    const words = wordsFrom(`${finalText} ${interim}`, this.shownFrom).split(' ').filter(Boolean)
    this.patch({ words: words.slice(-WORD_COUNTS.visible).map(maskOffensive) })
    if (!this.awake) {
      const end = greetingEnd(words)
      if (end !== null) this.wake(this.shownFrom + end)
      else if (asksForWord(wordsFrom(this.transcript.text, this.segment.wordMark))) this.wake(Math.max(this.shownFrom, this.segment.wordMark), false)
    }
    this.checkSuccess()
  }

  private hear(finalText: string, interim: string) {
    this.markVoice(performance.now())
    this.setText(finalText, interim)
  }

  private composeCloud() {
    const { final, interim } = this.transcript.composeCloud(performance.now())
    this.setText(final, interim)
  }

  private onBrowserResult(finals: string, interim: string) {
    const deaf = this.simulating || performance.now() < this.deafUntil
    if (this.transcript.noteBrowser(finals, interim, deaf) === 'dropped' || this.simulating) return
    if (!this.cloudEar) {
      const heard = this.transcript.browserOnly()
      this.hear(heard.final, heard.interim)
      return
    }
    const now = performance.now()
    if (!this.transcript.vadAlive(now)) this.markVoice(now)
    else this.transcript.syncBrowserMark(now)
    this.composeCloud()
  }

  private startBrowserEar() {
    if (!this.options.listen) return false
    const outcome = this.browserEar.start()
    if (outcome === 'unsupported') return false
    this.browserListening = true
    if (outcome === 'blocked') {
      if (!this.cloudEar) this.setMic('blocked')
      return true
    }
    this.setMic('listening')
    this.patch({ ear: this.cloudEar ? 'openrouter' : 'browser' })
    return true
  }

  private scheduleCloudRetry() {
    if (this.retryTimer !== null || !this.running) return
    this.retryTimer = window.setTimeout(() => {
      this.retryTimer = null
      if (this.running && !this.cloudEar) this.startCloudEar()
    }, TIMING.earRetryMs)
  }

  private fallBackToBrowser() {
    this.cloudEar?.stop()
    this.cloudEar = null
    this.transcript.dropPartial()
    this.transcript.markBrowserConsumed()
    this.setNetwork('offline')
    this.patch({ ear: this.browserListening ? 'browser' : 'off' })
    if (!this.browserListening && this.running && !this.startBrowserEar()) this.setMic('unsupported')
    this.scheduleCloudRetry()
  }

  private startCloudEar() {
    if (!this.options.listen || this.cloudStarting || this.cloudEar || !this.running) return
    this.cloudStarting = true
    void startCloudEar({
      onVoice: () => {
        const now = performance.now()
        if (this.simulating || now < this.deafUntil) return
        this.transcript.noteVoice(now)
        this.markVoice(now)
      },
      onPartial: (segment, text) => {
        if (this.simulating || !this.transcript.notePartial(segment, text)) return
        this.composeCloud()
      },
      onCommit: (segment, text, ms) => {
        if (this.simulating) return
        this.transcript.noteCommit(segment, text)
        this.setNetwork('online')
        this.patch({ latency: { ...this.state.latency, stt: ms } })
        this.composeCloud()
      },
      onFail: () => this.fallBackToBrowser()
    }).catch(() => null).then(ear => {
      this.cloudStarting = false
      if (!this.running) {
        ear?.stop()
        return
      }
      if (!ear) {
        if (!this.browserListening && !this.startBrowserEar()) this.patch({ mic: browserSpeechSupported() ? 'blocked' : 'unsupported', ear: 'off' })
        return
      }
      this.cloudEar = ear
      if (isMobile() && this.browserListening) {
        this.browserEar.stop()
        this.browserListening = false
      }
      if (this.voice?.speaking()) ear.mute(true)
      this.transcript.markBrowserConsumed()
      this.setMic('listening')
      this.patch({ ear: 'openrouter' })
    })
  }

  private readonly onOnline = () => {
    if (!this.cloudEar) this.startCloudEar()
  }

  private readonly onOffline = () => this.setNetwork('offline')

  private activityAt(now: number): Activity {
    const mic = this.state.mic
    if (mic !== 'listening' && mic !== 'simulating') return 'off'
    if (!this.awake) return 'waiting'
    if (this.phase === 'success') return 'recalled'
    if (this.phase === 'cue' || this.phase === 'given') return 'helping'
    const silence = now - this.lastSpeechAt
    const transcribing = this.cloudEar !== null && !this.cloudEar.idle()
    if (silence < TIMING.hearingMs) return 'hearing'
    if (this.judging || (this.ahead.pending() && silence >= TIMING.thinkingSilenceMs)) return 'thinking'
    return transcribing ? 'hearing' : 'listening'
  }

  private readonly tick = () => {
    const now = performance.now()
    const activity = this.activityAt(now)
    if (activity !== this.state.activity) this.patch({ activity })
    if (now < this.deafUntil) {
      if (this.phase === 'cue' && this.session && this.voice?.speaking()) this.session.lastCueAt = now
      return
    }
    if (this.phase === 'idle' && this.awake) this.watchForStall(now)
    else if (this.phase === 'cue' && this.session) this.guideSession(this.session, now)
  }

  private watchForStall(now: number) {
    const startedAt = this.segment.startedAt
    if (startedAt === null || this.segment.handled) return
    const silence = now - this.lastSpeechAt
    const settled = !this.cloudEar || this.simulating || this.cloudEar.idle()
    const text = lastWords(this.transcript.text, WORD_COUNTS.recent)
    const coolingDown = now - this.blockEndedAt < BLOCK_TIMING.cooldownMs
    if (settled && silence >= TIMING.aheadSilenceMs && !coolingDown && text.split(' ').filter(Boolean).length >= BLOCK_TIMING.minWords) void this.ahead.request(text)
    const heard = this.transcript.heardByBrowser
    const decision = stallDecision({
      phase: this.phase,
      blockActive: this.session !== null,
      speechMs: this.lastSpeechAt - startedAt,
      silenceMs: silence,
      sinceBlockEndMs: now - this.blockEndedAt,
      settled,
      newText: wordsFrom(this.transcript.text, this.segment.wordMark),
      recentText: text,
      browserTail: heard.at >= startedAt ? heard.text : ''
    })
    if (decision === 'wait' || (decision === 'judge' && this.judging)) return
    this.segment.handled = true
    if (decision === 'start') this.startHelp()
    else void this.awaitGuess(text, true)
  }

  private guideSession(session: HelpSession, now: number) {
    const silence = now - this.lastSpeechAt
    const sinceCue = now - session.lastCueAt
    const fresh = wordsFrom(this.transcript.text, session.cueWordMark)
    const verdict = session.verdict
    if (asksForWord(fresh) && sinceCue >= TIMING.minCueGapMs) {
      this.showLevel(session.wordLevel)
      return
    }
    if (silence < TIMING.struggleSilenceMs) return
    const settled = !this.cloudEar || this.simulating || this.cloudEar.idle() || silence >= BLOCK_TIMING.settleWaitMs
    if (!settled) return
    if (reachesFor(fresh, namesOf(session.target)) && silence < TIMING.talkQuietMs) return
    const upToDate = !session.assessing && session.assessedText === fresh
    if (upToDate && wantsWord(verdict?.help, verdict?.frustration) && sinceCue >= TIMING.minCueGapMs) {
      this.showLevel(session.wordLevel)
      return
    }
    const local = struggleOf(fresh)
    const opening = session.level === session.startLevel ? session.openingStruggle : 0
    const frustration = Math.max(local.frustration, verdict?.frustration ?? 0, opening)
    if ((local.givingUp || verdict?.help === 'strong' || frustration >= THRESHOLDS.strongFrustration) && sinceCue >= TIMING.minCueGapMs) {
      this.escalate()
      return
    }
    if (fresh && session.assessedText !== fresh && !session.assessing && !this.simulating) {
      session.assessedText = fresh
      void this.assessStruggle(session)
    }
    if (silence < TIMING.segmentGapMs) return
    if (session.assessing && silence < TIMING.assessWaitMs) return
    const talking = (local.frustration < THRESHOLDS.calmFrustration && closesThought(fresh, WORD_COUNTS.talk)) || verdict?.help === 'wait'
    const said = wordsFrom(this.transcript.text, session.wordMark)
    const calm = talking || (verdict
      ? verdict.help === 'wait' && !verdict.stalled && verdict.frustration < THRESHOLDS.calmFrustration
      : local.frustration < THRESHOLDS.calmFrustration && !local.hesitant)
    if (calm && closesThought(said, WORD_COUNTS.drift)) {
      this.backToIdle()
      return
    }
    if (talking && silence < TIMING.talkQuietMs) return
    const wait = verdict?.help === 'next' || frustration >= THRESHOLDS.fastFrustration
      ? TIMING.frustratedNextMs
      : local.hesitant || frustration >= THRESHOLDS.hesitantFrustration
        ? TIMING.hesitantNextMs
        : TIMING.calmNextMs
    if (sinceCue >= wait) this.nextLevel()
  }
}
