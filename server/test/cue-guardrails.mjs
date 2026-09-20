import { spawn } from 'child_process'
import { readFileSync } from 'fs'

import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = resolve(HERE, '..')
const STUB = resolve(HERE, 'model-stub.mjs')
const GRAPH = resolve(SERVER_DIR, '../web/src/data/graph.json')

const graph = JSON.parse(readFileSync(GRAPH, 'utf8'))
const projection = {
  owner: graph.owner,
  nodes: Object.values(graph.nodes).map(n => ({
    id: n.id,
    kind: n.kind,
    attrKeys: Object.keys(n.attrs),
    hasPhonology: Boolean(n.phon)
  })),
  edges: graph.edges.map(e => ({ id: e.id, from: e.from, to: e.to, rel: e.rel, weight: e.weight }))
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function wait(url, tries = 40) {
  for (let i = 0; i < tries; i++) {
    try {
      await fetch(url)
      return true
    } catch {
      await sleep(250)
    }
  }
  return false
}

const PROVIDERS = [
  { name: 'anthropic', env: { ANTHROPIC_API_KEY: 'stub-key', CUE_MODEL: 'claude-sonnet-5' } },
  { name: 'gratuito', env: { OPENAI_COMPAT_API_KEY: 'stub-key', CUE_MODEL: 'stub-free' } }
]

async function withStack(mode, provider, fn) {
  const stub = spawn(process.execPath, [STUB], {
    env: { ...process.env, STUB_MODE: mode },
    stdio: 'ignore'
  })
  const api = spawn(process.execPath, ['-r', 'dotenv/config', 'dist/main.js'], {
    cwd: SERVER_DIR,
    env: {
      ...process.env,
      PORT: '3399',
      MODEL_BASE_URL: 'http://127.0.0.1:4444',
      ...provider.env
    },
    stdio: 'ignore'
  })

  try {
    await wait('http://127.0.0.1:4444/__received')
    await wait('http://127.0.0.1:3399/v1/health')
    return await fn()
  } finally {
    api.kill()
    stub.kill()
    await sleep(600)
  }
}

function rank() {
  return fetch('http://127.0.0.1:3399/v1/cue/rank', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      subject: 'subject_test',
      projection,
      activeNodes: [graph.owner],
      hints: { kind: 'person' },
      lastLevel: null
    })
  }).then(r => r.json())
}

const results = []

for (const provider of PROVIDERS)
for (const [mode, expectation] of [
  ['valid', 'model'],
  ['ghostEdge', 'deterministic'],
  ['ghostAttr', 'deterministic'],
  ['foreignEdge', 'deterministic'],
  ['error', 'deterministic'],
  ['timeout', 'deterministic']
]) {
  const outcome = await withStack(mode, provider, async () => {
    const plan = await rank()
    const sent = await fetch('http://127.0.0.1:4444/__received').then(r => r.json())
    const prompt = JSON.stringify(sent ?? {})
    return { origin: plan.origin, steps: plan.steps?.length ?? 0, prompt }
  })

  const leak = /Let[ií]cia|Marina|Sorocaba|Ubatuba|Escumadeira|Lel[eê]/i.exec(outcome.prompt)
  results.push({
    provedor: provider.name,
    modo: mode,
    esperado: expectation,
    origem: outcome.origin,
    degraus: outcome.steps,
    ok: outcome.origin === expectation,
    vazouPalavra: leak ? leak[0] : 'nao'
  })
}

console.table(results)
const passed = results.every(r => r.ok && r.vazouPalavra === 'nao')
console.log(passed ? 'TODOS PASSARAM' : 'FALHOU')
process.exit(passed ? 0 : 1)
