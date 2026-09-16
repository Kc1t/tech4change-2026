'use client'

import { useEffect, useState } from 'react'

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null)

  useEffect(() => {
    const capture = (incoming: Event) => {
      incoming.preventDefault()
      setEvent(incoming as InstallEvent)
    }
    const installed = () => setEvent(null)

    window.addEventListener('beforeinstallprompt', capture)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.removeEventListener('beforeinstallprompt', capture)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  async function install() {
    if (!event) return
    await event.prompt()
    await event.userChoice
    setEvent(null)
  }

  return { available: event !== null, install }
}
