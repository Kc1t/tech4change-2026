import { Fragment } from 'react'
import { RemoteControl } from './remote-control'
import type { SlideEntry } from './types'
import type { RemoteLinks } from './use-deck-link'

type SlideMenuProps = {
  slides: SlideEntry[]
  current: number
  open: boolean
  go: (index: number) => void
  remote: { links: RemoteLinks | null; remotes: number }
}

export function SlideMenu({ slides, current, open, go, remote }: SlideMenuProps) {
  const parts = [...new Set(slides.map(slide => slide.part))]
  return (
    <nav id="slide-menu" className={`slide-menu${open ? '' : ' closed'}`} aria-hidden={!open} onClick={event => event.stopPropagation()}>
      {parts.map(part => (
        <Fragment key={part}>
          <h4>{part}</h4>
          {slides.map((slide, index) => slide.part === part && (
            <button key={index} className={index === current ? 'current' : undefined} tabIndex={open ? 0 : -1} onClick={() => go(index)}>
              <span>{index + 1}</span>{slide.name}
            </button>
          ))}
        </Fragment>
      ))}
      <h4>Controle remoto</h4>
      <RemoteControl links={remote.links} remotes={remote.remotes} open={open} />
      <p className="key-hint">← → · M esconde o sumário</p>
    </nav>
  )
}
