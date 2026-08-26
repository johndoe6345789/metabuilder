'use client'

/**
 * The Styles tab in plain English.
 *
 * A style is stored as CSS declarations, but nobody should have to know that
 * to use it: every control below names what it *does* ("Space inside") rather
 * than the property it writes (padding), and offers the handful of values
 * that are actually useful instead of a free-text box that accepts anything.
 *
 * Each control owns exactly one CSS property, so the stored shape stays a
 * plain Record<string, string> and anything typed in the Advanced editor
 * shows up in these controls too.
 */

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

export const STYLE_GROUPS: StyleGroup[] = [
  {
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
    ],
  },
  {
    id: 'background',
    label: 'Background',
    icon: 'format_color_fill',
    controls: [
      { kind: 'color', prop: 'background-color', label: 'Background colour' },
    ],
  },
  {
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
  },
  {
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
  },
  {
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
  },
]

/** Every property the visual controls manage, for the Advanced list to skip. */
export const MANAGED_PROPS = new Set(
  STYLE_GROUPS.flatMap(g => g.controls.map(c => c.prop))
)

/**
 * A CSS class name from whatever the user typed. They should be able to call
 * a style "Big red heading" without learning that a class cannot contain
 * spaces or start with a digit.
 */
export function toClassName(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug === '') return 'style'
  return /^[0-9]/.test(slug) ? `s-${slug}` : slug
}

/**
 * A CSS property name from whatever is stored. Older classes were saved with
 * React casing ("borderRadius"), which is not valid CSS and would be emitted
 * verbatim into the published stylesheet, so normalise on the way out.
 */
export function toCssProp(name: string): string {
  return name.startsWith('--')
    ? name
    : name.replace(/[A-Z]/g, ch => `-${ch.toLowerCase()}`)
}

/**
 * Declarations as CSS text. Values are stripped of the characters that could
 * end the rule early, so a stray "}" in a value cannot leak styles out of the
 * preview into the panel around it.
 */
export function toCssText(props: Record<string, string>): string {
  return Object.entries(props)
    .map(([k, v]) => `  ${toCssProp(k)}: ${v.replace(/[{}<>;]/g, '')};`)
    .join('\n')
}
