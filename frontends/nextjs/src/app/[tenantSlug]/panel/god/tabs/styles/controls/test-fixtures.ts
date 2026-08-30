import type { StyleControl } from '../style-controls'

export const choiceFixture: StyleControl = {
  kind: 'choice',
  prop: 'text-align',
  label: 'Align',
  options: [
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
  ],
}

export const colorFixture: StyleControl = {
  kind: 'color',
  prop: 'color',
  label: 'Text colour',
}

export const toggleFixture: StyleControl = {
  kind: 'toggle',
  prop: 'font-style',
  label: 'Italic',
  on: 'italic',
}

export const sizeFixture: StyleControl = {
  kind: 'size',
  prop: 'font-size',
  label: 'Size',
  min: 8,
  max: 48,
  step: 1,
  unit: 'px',
}
