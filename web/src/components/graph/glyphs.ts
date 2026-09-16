import type { NodeKind } from '@/domain/types'

export const KIND_GLYPH: Record<NodeKind, string> = {
  person: 'M12 11.4a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8M5.6 19.4c0-3.3 2.9-5.2 6.4-5.2s6.4 1.9 6.4 5.2',
  place: 'M4.4 11 12 4.9l7.6 6.1M6.6 9.6v9.6h10.8V9.6M10.3 19.2v-4.6h3.4v4.6',
  object: 'M12 3.8 19.6 8v8L12 20.2 4.4 16V8zM4.4 8 12 12.2 19.6 8M12 12.2v8',
  animal:
    'M9.1 8.8a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8M14.9 8.8a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8M5.4 13.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6M18.6 13.6a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6M12 19.8c-2.6 0-4.7-1.5-4.7-3.4 0-2 2.1-4.3 4.7-4.3s4.7 2.3 4.7 4.3c0 1.9-2.1 3.4-4.7 3.4',
  event: 'M5.4 7.4h13.2v11.8H5.4zM5.4 11.2h13.2M9 4.8v3.2M15 4.8v3.2'
}

export const KIND_LABEL: Record<NodeKind, string> = {
  person: 'Pessoa',
  place: 'Lugar',
  object: 'Coisa',
  event: 'Momento',
  animal: 'Bicho'
}
