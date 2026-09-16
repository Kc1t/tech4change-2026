package com.wordpath.watch

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager

object CuePatterns {

    private val LEVEL_1 = longArrayOf(0, 60)
    private val LEVEL_2 = longArrayOf(0, 60, 80, 60)
    private val LEVEL_3 = longArrayOf(0, 60, 80, 60, 80, 60)
    private val FINAL = longArrayOf(0, 220)
    private val SUCCESS = longArrayOf(0, 30, 40, 30, 40, 120)
    private val CONFIRM = longArrayOf(0, 40)

    fun forLevel(level: Int, isFinal: Boolean): LongArray = when {
        isFinal -> FINAL
        level >= 3 -> LEVEL_3
        level == 2 -> LEVEL_2
        else -> LEVEL_1
    }

    fun confirm(context: Context, intensity: Int) = play(context, CONFIRM, intensity)

    fun success(context: Context, intensity: Int) = play(context, SUCCESS, intensity)

    fun play(context: Context, pattern: LongArray, intensity: Int) {
        val vibrator = vibrator(context) ?: return
        if (!vibrator.hasVibrator()) return

        val scale = 0.5 + intensity * 0.2
        val scaled = pattern.mapIndexed { index, ms ->
            if (index % 2 == 1) (ms * scale).toLong() else ms
        }.toLongArray()

        if (vibrator.hasAmplitudeControl()) {
            val amplitudes = scaled.mapIndexed { index, _ ->
                if (index % 2 == 1) (255 * minOf(1.0, scale)).toInt() else 0
            }.toIntArray()
            vibrator.vibrate(VibrationEffect.createWaveform(scaled, amplitudes, -1))
        } else {
            vibrator.vibrate(VibrationEffect.createWaveform(scaled, -1))
        }
    }

    private fun vibrator(context: Context): Vibrator? =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(VibratorManager::class.java)
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
}
