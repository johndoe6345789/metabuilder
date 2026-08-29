/** Small builders for the declarative page trees the seeder writes. */



/** The tree a demo page renders. Returned as a node, not a string: it is
 *  written to PageTreeNode/PageTreeProp rows, not stored as a document. */
export function pageShell(
  template: Record<string, unknown>
): Record<string, unknown> {
  return template.render as Record<string, unknown>
}

export function stack(
  children: Record<string, unknown>[],
  props: Record<string, unknown> = {}
) {
  return { type: 'Stack', props, children }
}

export function card(
  children: Record<string, unknown>[],
  props: Record<string, unknown> = {}
) {
  return { type: 'Card', props, children }
}

export function paper(
  children: Record<string, unknown>[],
  props: Record<string, unknown> = {}
) {
  return { type: 'Paper', props, children }
}

export function heading(text: string, variant: string = 'h4') {
  return { type: 'Typography', props: { variant }, children: [text] }
}

export function body(text: string, variant: string = 'body1') {
  return { type: 'Typography', props: { variant }, children: [text] }
}

export function button(label: string, href: string, variant: string = 'contained') {
  return {
    type: 'Button',
    props: { variant, href, component: 'a' },
    children: [label],
  }
}

export function chip(label: string, color?: string) {
  return color === undefined
    ? { type: 'Chip', props: { label, size: 'small' }, children: [] }
    : { type: 'Chip', props: { label, size: 'small', color }, children: [] }
}
