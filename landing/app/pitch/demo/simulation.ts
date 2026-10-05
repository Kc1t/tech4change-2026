export type SimulationStep = { at: number; text: string; final?: boolean; afterSound?: boolean }

export const SIMULATION: SimulationStep[] = [
  { at: 0, text: 'Vó, quem veio te visitar ontem?', final: true },
  { at: 2400, text: 'Ontem' },
  { at: 2750, text: 'Ontem a minha' },
  { at: 3100, text: 'Ontem a minha neta' },
  { at: 3450, text: 'Ontem a minha neta veio' },
  { at: 3800, text: 'Ontem a minha neta veio me visitar' },
  { at: 4300, text: 'Ontem a minha neta veio me visitar, a', final: true },
  { at: 8000, text: 'a…', final: true },
  { at: 1800, text: 'a Letícia', final: true, afterSound: true }
]
