import type { StyleGroup } from './types'

export const BACKGROUND_GROUP: StyleGroup = {
  id: 'background',
  label: 'Background',
  icon: 'format_color_fill',
  controls: [
    { kind: 'color', prop: 'background-color', label: 'Background colour' },
  ],
}

export const SPACING_GROUP: StyleGroup = {
  id: 'spacing',
  label: 'Spacing',
  icon: 'space_bar',
  controls: [
    {
      kind: 'size',
      prop: 'padding',
      label: 'Space inside',
      hint: 'Between the edge and the content',
      min: 0,
      max: 64,
      step: 2,
      unit: 'px',
    },
    {
      kind: 'size',
      prop: 'margin',
      label: 'Space outside',
      hint: 'Between this and whatever is next to it',
      min: 0,
      max: 64,
      step: 2,
      unit: 'px',
    },
  ],
}
