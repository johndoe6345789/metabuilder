import type { StyleGroup } from './types'

export const TEXT_GROUP: StyleGroup = {
  id: 'text',
  label: 'Text',
  icon: 'title',
  controls: [
    {
      kind: 'choice',
      prop: 'font-size',
      label: 'Size',
      options: [
        { label: 'Small', value: '0.85rem' },
        { label: 'Normal', value: '1rem' },
        { label: 'Large', value: '1.25rem' },
        { label: 'Huge', value: '1.75rem' },
        { label: 'Giant', value: '2.5rem' },
      ],
    },
    {
      kind: 'choice',
      prop: 'font-weight',
      label: 'Weight',
      options: [
        { label: 'Light', value: '300' },
        { label: 'Normal', value: '400' },
        { label: 'Medium', value: '600' },
        { label: 'Bold', value: '700' },
      ],
    },
    { kind: 'color', prop: 'color', label: 'Text colour' },
    {
      kind: 'choice',
      prop: 'text-align',
      label: 'Alignment',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Centre', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
    { kind: 'toggle', prop: 'font-style', label: 'Italic', on: 'italic' },
    {
      kind: 'toggle',
      prop: 'text-transform',
      label: 'ALL CAPS',
      on: 'uppercase',
    },
    { kind: 'toggle', prop: 'text-decoration', label: 'Underline', on: 'underline' },
    {
      kind: 'size',
      prop: 'line-height',
      label: 'Line spacing',
      hint: 'Space between lines of text',
      min: 1,
      max: 2.5,
      step: 0.1,
      unit: '',
    },
    {
      kind: 'size',
      prop: 'letter-spacing',
      label: 'Letter spacing',
      hint: 'Space between characters',
      min: 0,
      max: 0.3,
      step: 0.01,
      unit: 'em',
    },
  ],
}
