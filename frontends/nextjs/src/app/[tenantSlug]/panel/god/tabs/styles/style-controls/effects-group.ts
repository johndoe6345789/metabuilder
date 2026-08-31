import type { StyleGroup } from './types'

export const EFFECTS_GROUP: StyleGroup = {
  id: 'effects',
  label: 'Effects',
  icon: 'auto_awesome',
  controls: [
    {
      kind: 'choice',
      prop: 'box-shadow',
      label: 'Shadow',
      hint: 'Lifts the element off the page',
      options: [
        { label: 'Soft', value: '0 1px 3px rgba(0,0,0,0.16)' },
        { label: 'Medium', value: '0 4px 12px rgba(0,0,0,0.18)' },
        { label: 'Strong', value: '0 10px 28px rgba(0,0,0,0.24)' },
      ],
    },
    {
      kind: 'size',
      prop: 'opacity',
      label: 'Transparency',
      hint: '1 is solid, 0 is invisible',
      min: 0.1,
      max: 1,
      step: 0.1,
      unit: '',
    },
  ],
}
