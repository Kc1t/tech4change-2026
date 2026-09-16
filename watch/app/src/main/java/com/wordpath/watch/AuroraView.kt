package com.wordpath.watch

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
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

    private val peach = ContextCompat.getColor(context, R.color.aurora_1)
    private val rose = ContextCompat.getColor(context, R.color.aurora_2)
    private val plum = ContextCompat.getColor(context, R.color.aurora_3)
    private val amber = ContextCompat.getColor(context, R.color.aurora_4)

    private val layers = listOf(
        Layer(
            base = 0.34f, amp = 0.035f, boost = 0.09f, freq = 1.1f, drift = 0.00021f, alpha = 204,
            colors = intArrayOf(amber, peach, rose), stops = floatArrayOf(0f, 0.55f, 1f)
        ),
        Layer(
            base = 0.52f, amp = 0.045f, boost = 0.15f, freq = 1.8f, drift = -0.00034f, alpha = 230,
            colors = intArrayOf(peach, rose, rose), stops = floatArrayOf(0f, 0.62f, 1f)
        ),
        Layer(
            base = 0.74f, amp = 0.035f, boost = 0.2f, freq = 2.7f, drift = 0.00047f, alpha = 242,
            colors = intArrayOf(peach, rose, plum), stops = floatArrayOf(0f, 0.5f, 1f)
        )
    )

    private val veilPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_IN)
    }

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

        val saved = canvas.saveLayer(0f, top, width, height.toFloat(), null)
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
                    sin(u * PI.toFloat() * layer.freq * 2f + phase) * 0.6f +
                        sin(u * PI.toFloat() * layer.freq * 5f + phase * 1.7f) * 0.3f +
                        sin(u * PI.toFloat() * layer.freq * 9f + phase * 2.4f) * 0.12f
                val y = layer.base * band - wave * amplitude
                if (i == 0) layer.path.moveTo(x, y) else layer.path.lineTo(x, y)
            }
            layer.path.lineTo(width, band)
            layer.path.lineTo(0f, band)
            layer.path.close()

            canvas.drawPath(layer.path, layer.paint)
        }

        if (veilPaint.shader == null) {
            veilPaint.shader = LinearGradient(
                0f, 0f, 0f, band,
                intArrayOf(Color.TRANSPARENT, Color.argb(191, 255, 255, 255), Color.WHITE),
                floatArrayOf(0f, 0.22f, 0.6f),
                Shader.TileMode.CLAMP
            )
        }
        canvas.drawRect(0f, 0f, width, band, veilPaint)
        canvas.restoreToCount(saved)

        if (!still || abs(target - level) > 0.001f) postInvalidateOnAnimation()
    }

    private companion object {
        const val STEPS = 56
        const val BAND = 0.62f
        const val HOLD_MS = 900L
        const val PERIOD_MS = 1_000_000L
    }
}
