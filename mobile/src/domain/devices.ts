import type { ChannelState } from './types'

export type DeviceKind = 'phone' | 'earbuds' | 'watch' | 'band' | 'tablet' | 'speaker'

export interface PairedDevice {
  id: string
  kind: DeviceKind
  name: string
  channel: keyof ChannelState | null
  on: boolean
  buzz: boolean
  haptics: boolean
  voice: boolean
  screen: boolean
  battery: number | null
}

export const KIND_LABEL: Record<DeviceKind, string> = {
  phone: 'celular',
  earbuds: 'fone',
  watch: 'relógio',
  band: 'pulseira',
  tablet: 'tablet',
  speaker: 'caixa de som'
}

export const KIND_GLYPH: Record<DeviceKind, string> = {
  phone:
    'M7.4 2.6h9.2a1.8 1.8 0 0 1 1.8 1.8v15.2a1.8 1.8 0 0 1-1.8 1.8H7.4a1.8 1.8 0 0 1-1.8-1.8V4.4a1.8 1.8 0 0 1 1.8-1.8ZM10.4 18.6h3.2',
  earbuds:
    'M12 3.4a7 7 0 0 0-7 7v5.2M12 3.4a7 7 0 0 1 7 7v5.2M5 13.4h1.6a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 18.4V15a1.6 1.6 0 0 1 1-1.6ZM19 13.4h-1.6a1.6 1.6 0 0 0-1.6 1.6v3.4a1.6 1.6 0 0 0 1.6 1.6h.8a1.6 1.6 0 0 0 1.6-1.6V15a1.6 1.6 0 0 0-.8-1.6Z',
  watch:
    'M12 7.4v4.2l2.6 1.6M8.6 4.6 9 2.4h6l.4 2.2M8.6 19.4 9 21.6h6l.4-2.2M12 19.4a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8Z',
  band: 'M9.2 2.6h5.6v18.8H9.2zM9.2 7.8h5.6v8.4H9.2zM11.2 11.2h1.6',
  tablet:
    'M5.6 2.8h12.8a1.4 1.4 0 0 1 1.4 1.4v15.6a1.4 1.4 0 0 1-1.4 1.4H5.6a1.4 1.4 0 0 1-1.4-1.4V4.2a1.4 1.4 0 0 1 1.4-1.4ZM10.6 18.4h2.8',
  speaker:
    'M6.4 2.8h11.2a1.4 1.4 0 0 1 1.4 1.4v15.6a1.4 1.4 0 0 1-1.4 1.4H6.4a1.4 1.4 0 0 1-1.4-1.4V4.2a1.4 1.4 0 0 1 1.4-1.4ZM12 16a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2ZM12 6.2h.01'
}

export const BUILT_IN_DEVICES: PairedDevice[] = [
  {
    id: 'phone',
    kind: 'phone',
    name: 'Este celular',
    channel: 'phone',
    on: true,
    buzz: true,
    haptics: true,
    voice: true,
    screen: true,
    battery: null
  },
  {
    id: 'earbuds',
    kind: 'earbuds',
    name: 'Fone de ouvido',
    channel: 'earbuds',
    on: true,
    buzz: false,
    haptics: false,
    voice: true,
    screen: false,
    battery: 72
  },
  {
    id: 'watch',
    kind: 'watch',
    name: 'Relógio',
    channel: 'watch',
    on: false,
    buzz: true,
    haptics: true,
    voice: false,
    screen: true,
    battery: 54
  }
]

export const DISCOVERABLE: PairedDevice[] = [
  {
    id: 'band',
    kind: 'band',
    name: 'Pulseira da Helena',
    channel: null,
    on: true,
    buzz: true,
    haptics: true,
    voice: false,
    screen: true,
    battery: 88
  },
  {
    id: 'tablet',
    kind: 'tablet',
    name: 'Tablet da sala',
    channel: null,
    on: true,
    buzz: false,
    haptics: false,
    voice: true,
    screen: true,
    battery: 41
  },
  {
    id: 'speaker',
    kind: 'speaker',
    name: 'Caixa da cozinha',
    channel: null,
    on: true,
    buzz: false,
    haptics: false,
    voice: true,
    screen: false,
    battery: null
  }
]

export function channelsFrom(devices: PairedDevice[]): ChannelState {
  const of = (channel: keyof ChannelState) => devices.find(device => device.channel === channel)
  const phone = of('phone')
  const earbuds = of('earbuds')
  const watch = of('watch')

  return {
    phone: Boolean(phone?.on && phone.buzz),
    earbuds: Boolean(earbuds?.on),
    watch: Boolean(watch?.on && watch.buzz)
  }
}

export function buzzTargets(devices: PairedDevice[]): PairedDevice[] {
  return devices.filter(device => device.haptics && device.on)
}

export function roleOf(device: PairedDevice): string {
  const roles: string[] = []
  if (device.on && device.buzz && device.haptics) roles.push('vibra')
  if (device.on && device.voice) roles.push('fala')
  if (device.on && device.screen) roles.push('mostra')
  return roles.length > 0 ? roles.join(' · ') : 'em silêncio'
}

export function undiscovered(devices: PairedDevice[]): PairedDevice[] {
  return DISCOVERABLE.filter(option => !devices.some(device => device.id === option.id))
}
