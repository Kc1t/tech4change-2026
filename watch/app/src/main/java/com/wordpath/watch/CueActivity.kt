package com.wordpath.watch

import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.core.content.ContextCompat
import androidx.core.content.res.ResourcesCompat
import androidx.lifecycle.lifecycleScope
import com.wordpath.watch.databinding.ActivityCueBinding
import kotlinx.coroutines.cancelAndJoin
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class CueActivity : ComponentActivity() {

    private lateinit var binding: ActivityCueBinding

    private val subject = "subject_watch"
    private var target = LifeGraph.targets.first()
    private var ladder = LifeGraph.ladder(LifeGraph.targets.first())
    private var level = 0
    private var paired = false
    private val lastLevel = mutableMapOf<String, Int>()
    private val goIdle = Runnable { reset() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCueBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.root.setOnClickListener { advance() }

        renderIdle()
        pairIfConfigured()
    }

    private fun pairIfConfigured() {
        lifecycleScope.launch {
            while (true) {
                val code = resolveCode()
                val id = SyncClient.join(code, SyncClient.batteryLevel(this@CueActivity))

                if (id == null) {
                    delay(DISCOVER_RETRY_MS)
                    continue
                }

                setPaired(true)

                val stream = launch {
                    SyncClient.stream(code) { cue -> runOnUiThread { receive(cue) } }
                }

                var misses = 0
                while (misses < MAX_MISSED_BEATS) {
                    delay(HEARTBEAT_MS)
                    val battery = SyncClient.batteryLevel(this@CueActivity)
                    val status = SyncClient.heartbeat(code, id, battery)
                    misses = if (status != null && status in 200..299) 0 else misses + 1
                }

                stream.cancelAndJoin()
                setPaired(false)
            }
        }
    }

    private fun setPaired(value: Boolean) {
        paired = value
        runOnUiThread { if (level == 0) renderIdle() else if (!value) reset() }
    }

    private suspend fun resolveCode(): String {
        val configured = BuildConfig.SESSION_CODE
        if (configured.isNotEmpty()) return configured

        while (true) {
            SyncClient.discover()?.let { return it }
            delay(DISCOVER_RETRY_MS)
        }
    }

    private fun buzz(pattern: LongArray, level: Int, isFinal: Boolean) {
        val played = CuePatterns.play(this, pattern, INTENSITY)
        CueShake.run(binding.stage, binding.trail, played, level, isFinal)
    }

    private fun receive(cue: SyncCue) {
        val incoming = LifeGraph.byId(cue.targetId) ?: return
        target = incoming
        ladder = LifeGraph.ladder(incoming)
        level = cue.level

        if (cue.event == "resolved") {
            buzz(CuePatterns.SUCCESS, cue.level, true)
            lastLevel[incoming.id] = cue.level
            showWord(incoming.label)
            holdThenIdle(RESET_DELAY_MS)
            return
        }

        val text = if (cue.isFinal) {
            incoming.firstSyllable?.let { "$it…" } ?: return
        } else {
            incoming.attrs[cue.attr] ?: return
        }

        buzz(CuePatterns.forLevel(cue.level, cue.isFinal), cue.level, cue.isFinal)
        binding.aurora.surge(glowFor(cue.level, cue.isFinal))
        showCue(cue.level, cue.isFinal, text)
        holdThenIdle(STALE_CUE_MS)
    }

    private fun holdThenIdle(delayMs: Long) {
        binding.root.removeCallbacks(goIdle)
        binding.root.postDelayed(goIdle, delayMs)
    }

    private fun advance() {
        if (level == 0) {
            CuePatterns.play(this, CuePatterns.CONFIRM, INTENSITY)
            binding.aurora.surge(0.3f)
            requestPlan()
        }

        if (level >= ladder.size) {
            resolve()
            return
        }

        level += 1
        val rung = ladder[level - 1]
        buzz(CuePatterns.forLevel(rung.level, rung.isFinal), rung.level, rung.isFinal)
        binding.aurora.surge(glowFor(rung.level, rung.isFinal))
        showCue(rung.level, rung.isFinal, rung.text)
    }

    private fun resolve() {
        buzz(CuePatterns.SUCCESS, level, true)
        binding.aurora.surge(1f)
        lastLevel[target.id] = level
        showWord(target.label)
        holdThenIdle(RESET_DELAY_MS)
    }

    private fun reset() {
        binding.root.removeCallbacks(goIdle)
        val next = LifeGraph.targets[(LifeGraph.targets.indexOf(target) + 1) % LifeGraph.targets.size]
        target = next
        ladder = LifeGraph.ladder(next)
        level = 0
        renderIdle()
    }

    private fun requestPlan() {
        lifecycleScope.launch {
            val plan = CueClient.rank(subject, "n_b1d93d", lastLevel[target.id]) ?: return@launch
            val ranked = LifeGraph.byId(plan.targetId) ?: return@launch
            if (level > 1) return@launch

            target = ranked
            ladder = LifeGraph.ladder(ranked, plan.order)
        }
    }

    private val idleFace by lazy { ResourcesCompat.getFont(this, R.font.manrope_semibold) }
    private val cueFace by lazy { ResourcesCompat.getFont(this, R.font.manrope_light) }

    private fun renderIdle() {
        binding.mark.visibility = View.VISIBLE
        binding.marks.clear()
        binding.trail.clear()
        binding.cue.typeface = idleFace
        binding.cue.textSize = IDLE_TEXT_SP
        binding.cue.setTextColor(ContextCompat.getColor(this, R.color.fg))
        binding.cue.text = getString(if (paired) R.string.waiting else R.string.searching)
    }

    private fun showCue(rung: Int, isFinal: Boolean, text: String) {
        binding.mark.visibility = View.GONE
        binding.marks.show(rung, isFinal)
        binding.cue.typeface = cueFace
        binding.cue.textSize = CUE_TEXT_SP
        binding.cue.setTextColor(ContextCompat.getColor(this, R.color.fg))
        binding.cue.text = text
    }

    private fun showWord(word: String) {
        binding.mark.visibility = View.GONE
        binding.marks.clear()
        binding.cue.typeface = cueFace
        binding.cue.textSize = CUE_TEXT_SP
        binding.cue.setTextColor(ContextCompat.getColor(this, R.color.accent))
        binding.cue.text = word
    }

    private fun glowFor(level: Int, isFinal: Boolean): Float = when {
        isFinal -> 1f
        level >= 3 -> 0.88f
        level == 2 -> 0.68f
        else -> 0.46f
    }

    private companion object {
        const val INTENSITY = 3
        const val IDLE_TEXT_SP = 15f
        const val CUE_TEXT_SP = 26f
        const val RESET_DELAY_MS = 3000L
        const val STALE_CUE_MS = 30_000L
        const val HEARTBEAT_MS = 20_000L
        const val DISCOVER_RETRY_MS = 3000L
        const val MAX_MISSED_BEATS = 2
    }
}
