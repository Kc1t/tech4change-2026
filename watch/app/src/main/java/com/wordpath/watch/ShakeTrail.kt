package com.wordpath.watch

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat

class ShakeTrail @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    private data class Mark(val level: Int, val isFinal: Boolean)

    private val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeCap = Paint.Cap.ROUND
        color = ContextCompat.getColor(context, R.color.accent)
    }

    private val fill = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = ContextCompat.getColor(context, R.color.accent)
    }

    private val body = RectF()
    private val wave = RectF()

    private val marks = ArrayDeque<Mark>()
    private var energy = 0f

    fun push(level: Int, isFinal: Boolean) {
        marks.addLast(Mark(level, isFinal))
        while (marks.size > CAPACITY) marks.removeFirst()
        invalidate()
    }

    fun clear() {
        marks.clear()
        energy = 0f
        invalidate()
    }

    fun setEnergy(value: Float) {
        energy = value
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        if (marks.isEmpty()) return

        val unit = height.toFloat()
        val step = unit + unit * GAP
        val span = step * marks.size - unit * GAP
        var cx = width / 2f - span / 2f + unit / 2f

        marks.forEachIndexed { index, mark ->
            val age = marks.size - 1 - index
            val fade = FADES.getOrElse(age) { FADES.last() }
            val live = age == 0
            draw(canvas, mark, cx, unit, fade, if (live) energy else 0f)
            cx += step
        }
    }

    private fun draw(canvas: Canvas, mark: Mark, cx: Float, unit: Float, fade: Float, energy: Float) {
        val cy = height / 2f
        val alpha = (255 * fade).toInt()

        stroke.strokeWidth = unit * 0.1f
        stroke.alpha = alpha
        fill.alpha = alpha

        val halfWidth = unit * 0.17f
        val halfHeight = unit * 0.29f
        body.set(cx - halfWidth, cy - halfHeight, cx + halfWidth, cy + halfHeight)
        val radius = unit * 0.075f

        if (mark.isFinal) {
            canvas.drawRoundRect(body, radius, radius, fill)
        } else {
            canvas.drawRoundRect(body, radius, radius, stroke)
        }

        val pairs = if (mark.isFinal) 2 else minOf(2, mark.level)
        for (rank in 1..pairs) {
            val radiusOut = unit * (0.28f + 0.14f * rank)
            val sweep = 44f + 16f * energy
            stroke.strokeWidth = unit * (0.09f - rank * 0.012f)
            stroke.alpha = (alpha * (0.62f + 0.38f * energy)).toInt()
            wave.set(cx - radiusOut, cy - radiusOut, cx + radiusOut, cy + radiusOut)
            canvas.drawArc(wave, 180f - sweep / 2f, sweep, false, stroke)
            canvas.drawArc(wave, -sweep / 2f, sweep, false, stroke)
        }

        stroke.alpha = 255
        fill.alpha = 255
    }

    private companion object {
        const val CAPACITY = 3
        const val GAP = 0.42f
        val FADES = floatArrayOf(1f, 0.46f, 0.25f)
    }
}
