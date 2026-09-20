package com.wordpath.watch

import android.content.Context
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import android.provider.Settings
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.sin

class AuroraView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    private class Layer(
        val base: Float,
        val amp: Float,
        val boost: Float,
        val freq: Float,
        val drift: Float,
        val alpha: Int,
        val colors: IntArray,
        val stops: FloatArray
    ) {
        val path = Path()
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    }

    private val lilac = ContextCompat.getColor(context, R.color.orb_1)
    private val pink = ContextCompat.getColor(context, R.color.orb_2)
    private val sky = ContextCompat.getColor(context, R.color.orb_3)
    private val blush = ContextCompat.getColor(context, R.color.orb_4)
    private val orbBase = ContextCompat.getColor(context, R.color.orb_base)

    private val layers = listOf(
        Layer(
            base = 0.15f, amp = 0.070f, boost = 0.09f, freq = 0.9f, drift = 0.00019f, alpha = 150,
            colors = intArrayOf(blush, orbBase, lilac), stops = floatArrayOf(0f, 0.5f, 1f)
        ),
        Layer(
            base = 0.32f, amp = 0.075f, boost = 0.14f, freq = 1.2f, drift = -0.00027f, alpha = 200,
            colors = intArrayOf(lilac, blush, pink), stops = floatArrayOf(0f, 0.55f, 1f)
        ),
        Layer(
            base = 0.56f, amp = 0.065f, boost = 0.18f, freq = 1.5f, drift = 0.00034f, alpha = 216,
            colors = intArrayOf(pink, lilac, sky), stops = floatArrayOf(0f, 0.5f, 1f)
        ),
        Layer(
            base = 0.80f, amp = 0.055f, boost = 0.20f, freq = 1.8f, drift = -0.00044f, alpha = 236,
            colors = intArrayOf(lilac, sky, lilac), stops = floatArrayOf(0f, 0.55f, 1f)
        )
    )

    private val still = Settings.Global.getFloat(
        context.contentResolver,
        Settings.Global.ANIMATOR_DURATION_SCALE,
        1f
    ) == 0f

    private var level = 0f
    private var target = 0f
    private var decayFrom = 0L

    fun surge(to: Float) {
        target = to.coerceIn(0f, 1f)
        decayFrom = System.currentTimeMillis()
        postInvalidateOnAnimation()
    }

    override fun onDraw(canvas: Canvas) {
        val width = width.toFloat()
        val band = height * BAND
        if (width <= 0f || band <= 0f) return

        if (System.currentTimeMillis() - decayFrom > HOLD_MS) target = 0f
        level += (target - level) * 0.16f

        val now = if (still) 0f else (System.currentTimeMillis() % PERIOD_MS).toFloat()
        val top = height - band

        val saved = canvas.save()
        canvas.clipRect(0f, top, width, height.toFloat())
        canvas.translate(0f, top)

        for (layer in layers) {
            if (layer.paint.shader == null) {
                layer.paint.shader = LinearGradient(
                    0f, 0f, width, band * 0.5f,
                    layer.colors, layer.stops, Shader.TileMode.CLAMP
                )
            }
            layer.paint.alpha = layer.alpha

            val amplitude = (layer.amp + level * layer.boost) * band
            val phase = now * layer.drift

            layer.path.rewind()
            for (i in 0..STEPS) {
                val u = i.toFloat() / STEPS
                val x = u * width
                val wave =
                    sin(u * PI.toFloat() * layer.freq * 2f + phase) * 0.78f +
                        sin(u * PI.toFloat() * layer.freq * 3.4f + phase * 1.6f) * 0.22f
                val y = layer.base * band - wave * amplitude
                if (i == 0) layer.path.moveTo(x, y) else layer.path.lineTo(x, y)
            }
            layer.path.lineTo(width, band)
            layer.path.lineTo(0f, band)
            layer.path.close()

            canvas.drawPath(layer.path, layer.paint)
        }

        canvas.restoreToCount(saved)

        if (!still || abs(target - level) > 0.001f) postInvalidateOnAnimation()
    }

    private companion object {
        const val STEPS = 56
        const val BAND = 0.36f
        const val HOLD_MS = 900L
        const val PERIOD_MS = 1_000_000L
    }
}
