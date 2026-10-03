import type { ReactNode } from 'react'

export type StepProps = { step: number; setStep: (step: number) => void }

export type SlideEntry = {
  part: string
  name: string
  label?: string
  bare?: boolean
  steps?: number
  listens?: boolean
  render: (props: StepProps) => ReactNode
}
