package com.wordpath.watch

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat

class RungMarks @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null
) : View(context, attrs) {

    private val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = ContextCompat.getColor(context, R.color.brand)
    }

    private val density = resources.displayMetrics.density
    private val dot = 6f * density
    private val gap = 7f * density
    private val dash = 26f * density

    private var count = 0
    private var stretched = false

    fun show(marks: Int, isFinal: Boolean) {
        count = if (isFinal) 1 else marks.coerceIn(0, MAX_PULSES)
        stretched = isFinal
        requestLayout()
        invalidate()
    }

    fun clear() {
        count = 0
        requestLayout()
        invalidate()
    }

    private companion object {
        const val MAX_PULSES = 3
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        val unit = if (stretched) dash else dot
        val width = if (count == 0) 0f else count * unit + (count - 1) * gap
        setMeasuredDimension(width.toInt(), dot.toInt())
    }

    override fun onDraw(canvas: Canvas) {
        if (count == 0) return
        val unit = if (stretched) dash else dot
        var left = 0f
        repeat(count) {
            canvas.drawRoundRect(left, 0f, left + unit, dot, dot / 2f, dot / 2f, paint)
            left += unit + gap
        }
    }
}
