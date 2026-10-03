import { useState } from 'react'
import type { RemoteLinks } from './use-deck-link'

const COPIED_MS = 2000

function connectedLabel(remotes: number): string {
  if (remotes === 0) return 'Nenhum controle conectado.'
  return remotes === 1 ? '1 controle conectado.' : `${remotes} controles conectados.`
}

export function RemoteControl({ links, remotes, open }: { links: RemoteLinks | null; remotes: number; open: boolean }) {
  const [copied, setCopied] = useState(false)
  const url = links?.public ?? links?.lan ?? null

  if (!url) return <p className="remote-control">Abra o deck em https://localhost:5174 para ligar o controle remoto.</p>

  const copy = () => {
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), COPIED_MS)
    })
  }

  return (
    <div className="remote-control">
      <button type="button" tabIndex={open ? 0 : -1} onClick={copy}>{copied ? 'Link copiado' : 'Copiar link do controle'}</button>
      <p>
        {links?.public ? 'Funciona pela internet. ' : 'Só nesta rede Wi-Fi. Para a internet, rode ngrok http https://localhost:5174. '}
        {connectedLabel(remotes)}
      </p>
    </div>
  )
}
