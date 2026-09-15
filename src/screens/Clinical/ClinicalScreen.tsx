import { useEffect, useRef } from 'react'

const WEEKLY_AVERAGE = [3.6, 3.4, 3.1, 2.9, 2.5, 2.3, 2.0, 1.8]

const WORDS = [
  { word: 'Letícia', state: 'precisa da escada', level: '3,4', token: '--mastery-low' },
  { word: 'Escumadeira', state: 'precisa de um degrau', level: '1,9', token: '--mastery-medium' },
  { word: 'Marina', state: 'diz sozinha', level: '0,2', token: '--mastery-high' },
  { word: 'Ubatuba', state: 'precisa da escada', level: '3,1', token: '--mastery-low' },
  { word: 'Tupi', state: 'precisa de um degrau', level: '1,4', token: '--mastery-medium' }
]

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function ClinicalScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
        pad.left + (i / (WEEKLY_AVERAGE.length - 1)) * (width - pad.left - pad.right)
      const py = (value: number) =>
        pad.top + (1 - (value - 1) / 3) * (height - pad.top - pad.bottom)

      ctx!.strokeStyle = token('--line-soft')
      ctx!.lineWidth = 1
      ctx!.font = '500 9px Archivo, sans-serif'
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

      const accent = token('--accent')
      const gradient = ctx!.createLinearGradient(0, pad.top, 0, height - pad.bottom)
      gradient.addColorStop(0, `${accent}40`)
      gradient.addColorStop(1, `${accent}00`)

      ctx!.beginPath()
      ctx!.moveTo(px(0), py(WEEKLY_AVERAGE[0]!))
      WEEKLY_AVERAGE.forEach((value, i) => ctx!.lineTo(px(i), py(value)))
      ctx!.lineTo(px(WEEKLY_AVERAGE.length - 1), height - pad.bottom)
      ctx!.lineTo(px(0), height - pad.bottom)
      ctx!.closePath()
      ctx!.fillStyle = gradient
      ctx!.fill()

      ctx!.beginPath()
      ctx!.moveTo(px(0), py(WEEKLY_AVERAGE[0]!))
      WEEKLY_AVERAGE.forEach((value, i) => ctx!.lineTo(px(i), py(value)))
      ctx!.strokeStyle = accent
      ctx!.lineWidth = 2
      ctx!.stroke()

      const lastX = px(WEEKLY_AVERAGE.length - 1)
      const lastY = py(WEEKLY_AVERAGE[WEEKLY_AVERAGE.length - 1]!)
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
      ctx!.fillText('sem 8', width - pad.right, height - pad.bottom + 8)
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <section className="flex flex-col gap-4 p-5">
      <div>
        <p className="label-caps">painel do fonoaudiólogo</p>
        <h2 className="voice mt-2 text-xl leading-tight">Helena · 8 semanas</h2>
        <span className="mt-2 inline-block rounded border border-dashed border-line px-2 py-1 text-[0.62rem] font-bold uppercase tracking-[0.1em] text-faint">
          dados simulados
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-card border border-line bg-surface p-4">
          <b className="voice tabular block text-xl font-normal">1,8</b>
          <span className="mt-0.5 block text-[0.68rem] leading-snug text-faint">
            degrau médio até destravar
          </span>
          <span className="mt-1 block text-[0.72rem] font-semibold text-mastery-high">
            −42% em 8 semanas
          </span>
        </div>
        <div className="rounded-card border border-line bg-surface p-4">
          <b className="voice tabular block text-xl font-normal">86</b>
          <span className="mt-0.5 block text-[0.68rem] leading-snug text-faint">
            bloqueios registrados fora da sessão
          </span>
        </div>
      </div>

      <div>
        <p className="label-caps mb-2">degrau médio por semana</p>
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
          {WORDS.map(row => (
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
