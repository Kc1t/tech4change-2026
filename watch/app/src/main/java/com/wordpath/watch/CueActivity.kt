package com.wordpath.watch

import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import com.wordpath.watch.databinding.ActivityCueBinding
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class CueActivity : ComponentActivity() {

    private lateinit var binding: ActivityCueBinding

    private val subject = "subject_watch"
    private var target = LifeGraph.targets.first()
    private var ladder = LifeGraph.ladder(LifeGraph.targets.first())
    private var level = 0
    private var origin = "deterministic"
    private val lastLevel = mutableMapOf<String, Int>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCueBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.root.setOnClickListener { advance() }
        binding.resolved.setOnClickListener { resolve() }

        renderIdle()
        pairIfConfigured()
    }

    private fun pairIfConfigured() {
        val code = BuildConfig.SESSION_CODE
        if (code.isEmpty()) return

        lifecycleScope.launch {
            val id = SyncClient.join(code) ?: return@launch
            binding.origin.text = getString(R.string.paired, code)

            launch {
                while (true) {
                    delay(HEARTBEAT_MS)
                    SyncClient.heartbeat(code, id)
                }
            }

            SyncClient.stream(code) { cue -> runOnUiThread { receive(cue) } }
        }
    }

    private fun receive(cue: SyncCue) {
        val incoming = LifeGraph.byId(cue.targetId) ?: return
        target = incoming
        ladder = LifeGraph.ladder(incoming)
        level = cue.level

        if (cue.event == "resolved") {
            CuePatterns.success(this, INTENSITY)
            binding.aurora.surge(1f)
            binding.cue.textSize = CUE_TEXT_SP
            binding.caption.text = getString(R.string.resolved_caption)
            binding.cue.text = incoming.label
            binding.source.text = getString(R.string.resolved_source, cue.level)
            binding.resolved.visibility = View.GONE
            return
        }

        val text = if (cue.isFinal) {
            incoming.firstSyllable?.let { "$it…" } ?: return
        } else {
            incoming.attrs[cue.attr] ?: return
        }

        CuePatterns.play(this, CuePatterns.forLevel(cue.level, cue.isFinal), INTENSITY)
        binding.aurora.surge(glowFor(cue.level, cue.isFinal))
        binding.cue.textSize = CUE_TEXT_SP
        binding.caption.text = getString(R.string.rung_caption, cue.level, LifeGraph.kindFor(cue.attr))
        binding.cue.text = text
        binding.source.text = cue.edge ?: ""
        binding.resolved.visibility = View.VISIBLE
    }

    private fun advance() {
        if (level == 0) {
            CuePatterns.confirm(this, INTENSITY)
            binding.aurora.surge(0.3f)
            requestPlan()
        }

        if (level >= ladder.size) return

        level += 1
        val rung = ladder[level - 1]
        CuePatterns.play(this, CuePatterns.forLevel(rung.level, rung.isFinal), INTENSITY)
        binding.aurora.surge(glowFor(rung.level, rung.isFinal))
        render(rung)
    }

    private fun resolve() {
        CuePatterns.success(this, INTENSITY)
        binding.aurora.surge(1f)
        binding.cue.textSize = CUE_TEXT_SP
        lastLevel[target.id] = level

        binding.caption.text = getString(R.string.resolved_caption)
        binding.cue.text = target.label
        binding.resolved.visibility = View.GONE
        binding.source.text = getString(R.string.resolved_source, level)

        binding.root.postDelayed({ reset() }, RESET_DELAY_MS)
    }

    private fun reset() {
        val next = LifeGraph.targets[(LifeGraph.targets.indexOf(target) + 1) % LifeGraph.targets.size]
        target = next
        ladder = LifeGraph.ladder(next)
        level = 0
        origin = "deterministic"
        renderIdle()
    }

    private fun requestPlan() {
        lifecycleScope.launch {
            val plan = CueClient.rank(subject, "n_b1d93d", lastLevel[target.id]) ?: return@launch
            val ranked = LifeGraph.byId(plan.targetId) ?: return@launch
            if (level > 1) return@launch

            target = ranked
            ladder = LifeGraph.ladder(ranked, plan.order)
            origin = plan.origin
            binding.origin.text = getString(R.string.origin, origin)
        }
    }

    private fun glowFor(level: Int, isFinal: Boolean): Float = when {
        isFinal -> 1f
        level >= 3 -> 0.88f
        level == 2 -> 0.68f
        else -> 0.46f
    }

    private fun renderIdle() {
        binding.cue.textSize = IDLE_TEXT_SP
        binding.caption.text = getString(R.string.idle_caption)
        binding.cue.text = getString(R.string.idle_cue)
        binding.source.text = ""
        binding.origin.text = ""
        binding.resolved.visibility = View.GONE
    }

    private fun render(rung: Rung) {
        binding.cue.textSize = CUE_TEXT_SP
        binding.caption.text = getString(R.string.rung_caption, rung.level, rung.kind)
        binding.cue.text = rung.text
        binding.source.text = rung.edge ?: ""
        binding.origin.text = getString(R.string.origin, origin)
        binding.resolved.visibility = View.VISIBLE
    }

    private companion object {
        const val INTENSITY = 3
        const val IDLE_TEXT_SP = 14f
        const val CUE_TEXT_SP = 23f
        const val RESET_DELAY_MS = 3000L
        const val HEARTBEAT_MS = 20_000L
    }
}
