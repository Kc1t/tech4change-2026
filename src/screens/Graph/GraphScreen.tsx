import { useEffect, useRef, useState } from 'react'
import { lifeGraph, useApp } from '@/store'
import type { Mastery, NodeId } from '@/domain/types'

type Lens = 'life' | 'learning'

interface Hitbox {
  id: NodeId
  x: number
  y: number
  r: number
}

const MASTERY_TOKEN: Record<Mastery, string> = {
  high: '--mastery-high',
  medium: '--mastery-medium',
  low: '--mastery-low',
  unseen: '--mastery-low'
}

function token(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function GraphScreen() {
  const learning = useApp(s => s.learning)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hitboxes = useRef<Hitbox[]>([])
  const [lens, setLens] = useState<Lens>('life')
  const [selected, setSelected] = useState<NodeId | null>(null)

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

      const pad = 34
      const px = (id: NodeId) => pad + lifeGraph.nodes[id]!.layout.x * (width - pad * 2)
      const py = (id: NodeId) => pad + lifeGraph.nodes[id]!.layout.y * (height - pad * 2)

      ctx!.strokeStyle = token('--line')
      ctx!.lineWidth = 1
      ctx!.globalAlpha = lens === 'learning' ? 0.45 : 0.8
      for (const edge of lifeGraph.edges) {
        ctx!.beginPath()
        ctx!.moveTo(px(edge.from), py(edge.from))
        ctx!.lineTo(px(edge.to), py(edge.to))
        ctx!.stroke()
      }
      ctx!.globalAlpha = 1

      hitboxes.current = []
      for (const node of Object.values(lifeGraph.nodes)) {
        const x = px(node.id)
        const y = py(node.id)
        const isOwner = node.id === lifeGraph.owner
        const radius = isOwner ? 26 : 20

        let fill = token('--surface-2')
        let stroke = token('--line')
        if (lens === 'learning') {
          const mastery = learning[node.id]?.mastery ?? 'unseen'
          fill = token(MASTERY_TOKEN[mastery])
          stroke = fill
        } else if (isOwner) {
          fill = token('--accent')
          stroke = fill
        }

        if (selected === node.id) {
          ctx!.beginPath()
          ctx!.arc(x, y, radius + 6, 0, Math.PI * 2)
          ctx!.strokeStyle = token('--accent')
          ctx!.lineWidth = 2
          ctx!.stroke()
        }

        ctx!.beginPath()
        ctx!.arc(x, y, radius, 0, Math.PI * 2)
        ctx!.fillStyle = fill
        ctx!.fill()
        ctx!.strokeStyle = stroke
        ctx!.lineWidth = 1
        ctx!.stroke()

        ctx!.fillStyle = lens === 'learning' || isOwner ? token('--ink') : token('--fg')
        ctx!.font = '600 10px Archivo, sans-serif'
        ctx!.textAlign = 'center'
        ctx!.textBaseline = 'middle'
        const label = node.label.length > 9 ? `${node.label.slice(0, 8)}.` : node.label
        ctx!.fillText(label, x, y)

        hitboxes.current.push({ id: node.id, x, y, r: radius + 10 })
      }
    }

    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [lens, selected, learning])

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const hit = hitboxes.current.find(box => Math.hypot(box.x - x, box.y - y) <= box.r)
    setSelected(hit ? hit.id : null)
  }

  const node = selected ? lifeGraph.nodes[selected] : null
  const edges = selected
    ? lifeGraph.edges.filter(edge => edge.from === selected || edge.to === selected)
    : []

  return (
    <section className="flex flex-col gap-4 p-5">
      <div>
        <p className="label-caps">o mapa</p>
        <h2 className="voice mt-2 text-xl leading-tight">
          A vida dela, e o que ela já recupera sozinha
        </h2>
        <p className="mt-1 text-xs text-dim">Toque num nó para ver de onde veio cada ligação.</p>
      </div>

      <div className="grid grid-cols-2 gap-1.5 rounded-card bg-surface-2 p-1">
        {(['life', 'learning'] as Lens[]).map(option => (
          <button
            key={option}
            onClick={() => setLens(option)}
            className={[
              'rounded-[9px] px-3 py-3 text-xs font-semibold',
              option === lens ? 'bg-surface text-fg shadow-soft' : 'text-dim'
            ].join(' ')}
          >
            {option === 'life' ? 'Vida' : 'Aprendizado'}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        onClick={handleClick}
        aria-label="Grafo da vida de Helena"
        className="h-[340px] w-full rounded-card border border-line-soft bg-surface"
      />

      <div className="flex flex-wrap gap-3 text-[0.7rem] text-dim">
        {lens === 'learning' ? (
          <>
            <Legend token="--mastery-high" label="diz sozinha" />
            <Legend token="--mastery-medium" label="precisa de um degrau" />
            <Legend token="--mastery-low" label="precisa da escada" />
          </>
        ) : (
          <>
            <Legend token="--accent" label="ela" />
            <Legend token="--surface-2" label="pessoas, lugares e coisas" />
          </>
        )}
      </div>

      {node && (
        <div className="animate-rise rounded-card border border-line bg-surface p-4">
          <span className="label-caps">
            {node.kind}
            {node.aliases ? ` · também chamada de ${node.aliases.join(', ')}` : ''}
          </span>
          <h3 className="voice mt-1 text-xl">{node.label}</h3>
          <ul className="mt-3 flex list-none flex-col gap-2 p-0">
            {edges.flatMap(edge =>
              edge.provenance.map((p, i) => (
                <li key={`${edge.id}-${i}`} className="flex gap-2 text-xs leading-relaxed text-dim">
                  <span className="w-1 shrink-0 rounded-sm bg-line" />
                  <span>
                    <b className="font-semibold text-fg">{p.source}</b> · {p.ref} — {p.detail}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      <p className="text-[0.68rem] leading-relaxed text-faint">
        Toda aresta carrega proveniência. Se o modelo citar uma ligação que não existe no grafo, a
        resposta inteira é rejeitada — por isso o sistema não consegue inventar uma parente.
      </p>
    </section>
  )
}

function Legend({ token: name, label }: { token: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i
        className="block h-[9px] w-[9px] rounded-full border border-line"
        style={{ background: `var(${name})` }}
      />
      {label}
    </span>
  )
}
