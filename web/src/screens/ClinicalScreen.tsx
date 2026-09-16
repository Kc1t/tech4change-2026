'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { clinicianSummary } from '@/api/client'
import { lifeGraph, useApp } from '@/store'
import type { ClinicianSummary, Mastery } from '@/domain/types'

const SIMULATED_AVERAGE = [3.6, 3.4, 3.1, 2.9, 2.5, 2.3, 2.0, 1.8]

const STATE_LABEL: Record<string, { text: string; token: string }> = {
  unaided: { text: 'diz sozinha', token: '--mastery-high' },
  one_rung: { text: 'precisa de um degrau', token: '--mastery-medium' },
  full_ladder: { text: 'precisa da escada', token: '--mastery-low' }
}

const MASTERY_STATE: Record<Mastery, { text: string; token: string }> = {
  high: { text: 'diz sozinha', token: '--mastery-high' },
  medium: { text: 'precisa de um degrau', token: '--mastery-medium' },
  low: { text: 'precisa da escada', token: '--mastery-low' },
  unseen: { text: 'ainda não apareceu', token: '--line' }
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function ClinicalScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const learning = useApp(s => s.learning)
  const [summary, setSummary] = useState<ClinicianSummary | null>(null)

  useEffect(() => {
    void clinicianSummary().then(result => {
      if (result && result.attempts > 0) setSummary(result)
    })
  }, [])

  const onDevice = useMemo(() => {
    return Object.entries(learning)
      .filter(([, state]) => state.lastSeen !== null)
      .map(([id, state]) => ({
        word: lifeGraph.nodes[id]?.label ?? id,
        state: MASTERY_STATE[state.mastery].text,
        level: (state.lastLevel ?? 0).toFixed(1).replace('.', ','),
        token: MASTERY_STATE[state.mastery].token,
        raw: state.lastLevel ?? 0
      }))
      .sort((a, b) => b.raw - a.raw)
  }, [learning])

  const live = summary !== null
  const source = live ? 'servidor' : onDevice.length > 0 ? 'aparelho' : 'simulado'

  const series = live ? summary.trend.map(point => point.averageLevel) : SIMULATED_AVERAGE

  const rows = live
    ? summary.targets.map(target => ({
        word: lifeGraph.nodes[target.targetId]?.label ?? target.targetId,
        state: STATE_LABEL[target.state]!.text,
        level: target.averageLevel.toFixed(1).replace('.', ','),
        token: STATE_LABEL[target.state]!.token
      }))
    : onDevice

  const average =
    onDevice.length > 0
      ? onDevice.reduce((sum, row) => sum + row.raw, 0) / onDevice.length
      : null

  const headline = live
    ? summary.averageLevel!.toFixed(1).replace('.', ',')
    : average !== null
      ? average.toFixed(1).replace('.', ',')
      : '—'

  const blocks = live ? summary.blocks : onDevice.length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = canvas!.clientWidth
      const height = canvas!.clientHeight
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx!.clearRect(0, 0, width, height)

      const pad = { top: 16, right: 14, bottom: 26, left: 26 }
      const px = (i: number) =>
        pad.left + (i / (series.length - 1)) * (width - pad.left - pad.right)
      const py = (value: number) =>
        pad.top + (1 - (value - 1) / 3) * (height - pad.top - pad.bottom)

      ctx!.strokeStyle = token('--line-soft')
      ctx!.lineWidth = 1
      ctx!.font = '500 9px Manrope, sans-serif'
      ctx!.textAlign = 'right'
      ctx!.textBaseline = 'middle'
      for (const value of [1, 2, 3, 4]) {
        ctx!.beginPath()
        ctx!.moveTo(pad.left, py(value))
        ctx!.lineTo(width - pad.right, py(value))
        ctx!.stroke()
        ctx!.fillStyle = token('--faint')
        ctx!.fillText(String(value), pad.left - 6, py(value))
      }

      const accent = token('--brand')
      const gradient = ctx!.createLinearGradient(0, pad.top, 0, height - pad.bottom)
      gradient.addColorStop(0, `${accent}40`)
      gradient.addColorStop(1, `${accent}00`)

      ctx!.beginPath()
      ctx!.moveTo(px(0), py(series[0]!))
      series.forEach((value, i) => ctx!.lineTo(px(i), py(value)))
      ctx!.lineTo(px(series.length - 1), height - pad.bottom)
      ctx!.lineTo(px(0), height - pad.bottom)
      ctx!.closePath()
      ctx!.fillStyle = gradient
      ctx!.fill()

      ctx!.beginPath()
      ctx!.moveTo(px(0), py(series[0]!))
      series.forEach((value, i) => ctx!.lineTo(px(i), py(value)))
      ctx!.strokeStyle = accent
      ctx!.lineWidth = 2
      ctx!.stroke()

      const lastX = px(series.length - 1)
      const lastY = py(series[series.length - 1]!)
      ctx!.beginPath()
      ctx!.arc(lastX, lastY, 4.5, 0, Math.PI * 2)
      ctx!.fillStyle = accent
      ctx!.fill()
      ctx!.strokeStyle = token('--surface')
      ctx!.lineWidth = 2
      ctx!.stroke()

      ctx!.fillStyle = token('--faint')
      ctx!.textBaseline = 'top'
      ctx!.textAlign = 'left'
      ctx!.fillText('sem 1', pad.left, height - pad.bottom + 8)
      ctx!.textAlign = 'right'
      ctx!.fillText(`sem ${series.length}`, width - pad.right, height - pad.bottom + 8)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [series.join(',')])

  return (
    <section className="flex flex-col gap-4 p-5">
      <div>
        <p className="label-caps">painel do fonoaudiólogo</p>
        <h2 className="voice mt-2 text-xl leading-tight">
          Helena
          {live
            ? ` · ${summary.trend.length} ${summary.trend.length === 1 ? 'semana' : 'semanas'}`
            : rows.length > 0
              ? ` · ${rows.length} ${rows.length === 1 ? 'palavra' : 'palavras'}`
              : ''}
        </h2>
        <span className="mt-2 inline-block rounded border border-dashed border-line px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-faint">
          {source === 'servidor'
            ? 'dados do servidor'
            : source === 'aparelho'
              ? 'dados deste aparelho'
              : 'sem dados ainda'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-card border border-line bg-surface p-4">
          <b className="voice tabular block text-xl font-normal">{headline}</b>
          <span className="mt-0.5 block text-[0.68rem] leading-snug text-faint">
            degrau médio até destravar
          </span>
          {live && (
            <span className="mt-1 block text-[0.72rem] font-semibold text-mastery-high">
              {summary.trend.length} semanas registradas
            </span>
          )}
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <b className="voice tabular block text-xl font-normal">{blocks}</b>
          <span className="mt-0.5 block text-[0.68rem] leading-snug text-faint">
            {live ? 'bloqueios registrados fora da sessão' : 'palavras exercitadas neste aparelho'}
          </span>
        </div>
      </div>

      <div>
        <p className="label-caps mb-2">
          degrau médio por semana
          {!live && <span className="ml-2 normal-case text-faint">· curva ilustrativa</span>}
        </p>
        <canvas
          ref={canvasRef}
          aria-label="Degrau médio caindo ao longo de oito semanas"
          className="h-[170px] w-full rounded-card border border-line-soft bg-surface"
        />
      </div>

      <table className="w-full border-collapse text-[0.78rem]">
        <thead>
          <tr>
            <th className="label-caps border-b border-line pb-2 text-left">Palavra</th>
            <th className="label-caps border-b border-line pb-2 text-left">Estado</th>
            <th className="label-caps border-b border-line pb-2 text-right">Degrau</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={3} className="py-6 text-center text-[0.72rem] leading-relaxed text-faint">
                Nenhuma palavra exercitada ainda. Destrave uma na tela Momento e ela aparece aqui.
              </td>
            </tr>
          )}
          {rows.map(row => (
            <tr key={row.word}>
              <td className="voice border-b border-line-soft py-3 text-[0.95rem]">{row.word}</td>
              <td className="border-b border-line-soft py-3">
                <span
                  className="inline-block rounded-full px-2.5 py-1 text-[0.66rem] font-bold"
                  style={{
                    background: `color-mix(in srgb, var(${row.token}) 15%, transparent)`,
                    color: `var(${row.token})`
                  }}
                >
                  {row.state}
                </span>
              </td>
              <td className="tabular border-b border-line-soft py-3 text-right text-dim">
                {row.level}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="text-[0.68rem] leading-relaxed text-faint">
        O indicador de sucesso é o degrau médio <em>caindo</em>. É uma ferramenta feita para deixar
        de ser necessária.
      </p>
    </section>
  )
}
