package com.wordpath.watch

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.ValueAnimator
import android.view.View
import kotlin.math.PI
import kotlin.math.sin

object CueShake {

    private const val TAIL_MS = 340L
    private const val AMPLITUDE_DP = 1.5f
    private const val BUZZ_HZ = 11f
    private const val RAMP_MS = 30f

    private var running: ValueAnimator? = null

    fun run(stage: View, trail: ShakeTrail, pattern: LongArray, level: Int, isFinal: Boolean) {
        running?.cancel()

        val span = pattern.sum()
        if (span <= 0L) return

        trail.push(level, isFinal)

        val total = (span + TAIL_MS).toFloat()
        val amplitude = AMPLITUDE_DP * stage.resources.displayMetrics.density

        running = ValueAnimator.ofFloat(0f, 1f).apply {
            duration = total.toLong()
            addUpdateListener { animation ->
                val elapsed = animation.animatedFraction * total
                val energy = energyAt(pattern, elapsed)
                val phase = elapsed / 1000f * BUZZ_HZ * 2f * PI.toFloat()

                stage.translationX = sin(phase) * amplitude * energy
                stage.translationY = sin(phase * 0.5f + 1.1f) * amplitude * 0.3f * energy

                trail.setEnergy(energy)
            }
            addListener(object : AnimatorListenerAdapter() {
                override fun onAnimationEnd(animation: Animator) = rest(stage, trail)
                override fun onAnimationCancel(animation: Animator) = rest(stage, trail)
            })
            start()
        }
    }

    private fun rest(stage: View, trail: ShakeTrail) {
        stage.translationX = 0f
        stage.translationY = 0f
        trail.setEnergy(0f)
    }

    private fun energyAt(pattern: LongArray, elapsed: Float): Float {
        var cursor = 0f
        for ((index, segment) in pattern.withIndex()) {
            val end = cursor + segment
            if (elapsed < end) {
                if (index % 2 == 0) return 0f
                val rise = (elapsed - cursor) / RAMP_MS
                val fall = (end - elapsed) / RAMP_MS
                return minOf(1f, rise, fall).coerceAtLeast(0f)
            }
            cursor = end
        }
        return 0f
    }
}
