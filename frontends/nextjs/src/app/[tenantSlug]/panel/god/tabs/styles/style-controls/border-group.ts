import type { StyleGroup } from './types'

export const BORDER_GROUP: StyleGroup = {
  id: 'border',
  label: 'Border',
  icon: 'border_style',
  controls: [
    {
      kind: 'size',
      prop: 'border-width',
      label: 'Thickness',
      min: 0,
      max: 8,
      step: 1,
      unit: 'px',
    },
    { kind: 'color', prop: 'border-color', label: 'Border colour' },
    {
      kind: 'choice',
      prop: 'border-style',
      label: 'Line style',
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Dashed', value: 'dashed' },
        { label: 'Dotted', value: 'dotted' },
      ],
    },
    {
      kind: 'size',
      prop: 'border-radius',
      label: 'Rounded corners',
      min: 0,
      max: 40,
      step: 2,
      unit: 'px',
    },
  ],
}
