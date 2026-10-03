import { useEffect, useState } from 'react'
import { ListOrdered, X } from 'lucide-react'

const IDLE_MS = 2500

function usePointerAwake() {
  const [awake, setAwake] = useState(false)

  useEffect(() => {
    let timer = 0
    const wake = () => {
      setAwake(true)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setAwake(false), IDLE_MS)
    }
    window.addEventListener('pointermove', wake)
    return () => {
      window.removeEventListener('pointermove', wake)
      window.clearTimeout(timer)
    }
  }, [])

  return awake
}

export function MenuToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const awake = usePointerAwake()
  const Icon = open ? X : ListOrdered

  return (
    <button
      type="button"
      className={`menu-toggle${open || awake ? ' shown' : ''}`}
      aria-label={open ? 'Fechar sumário' : 'Abrir sumário'}
      aria-expanded={open}
      aria-controls="slide-menu"
      onClick={event => {
        event.stopPropagation()
        onToggle()
      }}
    >
      <Icon aria-hidden />
    </button>
  )
}
