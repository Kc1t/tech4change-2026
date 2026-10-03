export type SimulationStep = { at: number; text: string; final?: boolean }

export const SIMULATION: SimulationStep[] = [
  { at: 0, text: 'Ontem' },
  { at: 350, text: 'Ontem a minha' },
  { at: 700, text: 'Ontem a minha neta' },
  { at: 1050, text: 'Ontem a minha neta veio' },
  { at: 1400, text: 'Ontem a minha neta veio me visitar' },
  { at: 1900, text: 'Ontem a minha neta veio me visitar, a', final: true },
  { at: 5600, text: 'a…', final: true },
  { at: 9500, text: 'a… como é que chama?', final: true },
  { at: 15000, text: 'a Letícia', final: true }
]
