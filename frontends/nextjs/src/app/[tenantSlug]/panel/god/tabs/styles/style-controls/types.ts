export type StyleControl =
  | {
      kind: 'choice'
      prop: string
      label: string
      hint?: string
      options: { label: string; value: string }[]
    }
  | { kind: 'color'; prop: string; label: string; hint?: string }
  | {
      kind: 'size'
      prop: string
      label: string
      hint?: string
      min: number
      max: number
      step: number
      unit: string
    }
  | { kind: 'toggle'; prop: string; label: string; hint?: string; on: string }

export interface StyleGroup {
  id: string
  label: string
  icon: string
  controls: StyleControl[]
}
