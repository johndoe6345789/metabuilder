/** Identity, class and aria props applied to every block, not just the ones
 * whose own render() happens to read them. */

/**
 * What renderNode clones onto a block: identity, class and aria, already
 * under their real DOM attribute names.
 *
 * A block whose render() returns a component rather than a plain element has
 * to declare this and spread it itself. cloneElement reaches only that
 * component's props, and a component destructuring the props it knows about
 * drops the rest -- so the author's class reached no DOM node at all.
 *
 * Spread it onto what the author means by "the block": the control itself,
 * never a wrapper around it as well. A workflow's page.class selector matches
 * every node carrying the class, so a class left on both would style the
 * wrapper too.
 */
export type BlockAttrs = Record<string, unknown>

export const COMMON_PROP_KEYS = [
  'id',
  'name',
  'className',
  'role',
  'tabIndex',
  'ariaLabel',
  'ariaDescribedby',
  'ariaHidden',
  'testId',
] as const

// Deliberately NOT here: `title`. Three blocks (list item, accordion,
// tooltip) already use props.title as their visible content, so injecting it
// as the DOM title attribute would hang a duplicate native tooltip off every
// existing one. aria-label covers the accessible-name case properly anyway.

/** Builder prop name -> real DOM attribute, where the two differ. */
const DOM_ATTR: Record<string, string> = {
  ariaLabel: 'aria-label',
  ariaDescribedby: 'aria-describedby',
  ariaHidden: 'aria-hidden',
  testId: 'data-testid',
}

export function commonAttrs(
  props: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of COMMON_PROP_KEYS) {
    const raw = props[key]
    // An empty string means the builder field was cleared, which is unset.
    if (raw === undefined || raw === null || raw === '') continue
    const attr = DOM_ATTR[key] ?? key
    out[attr] = key === 'tabIndex' ? Number(raw) : raw
  }
  return out
}

/**
 * A block's own class, plus the author's.
 *
 * The author's adds to what the block sets for itself rather than replacing
 * it -- a card that stops looking like a card the moment someone names it is
 * not what naming a thing means. A block forwarding BlockAttrs onto an
 * element it has already styled needs this: a bare spread would drop the
 * class it just set.
 */
export function withOwnClass(own: string, attrs: BlockAttrs): BlockAttrs {
  const added = attrs.className
  if (typeof added !== 'string' || added === '') {
    return { ...attrs, className: own }
  }
  return { ...attrs, className: own === '' ? added : `${own} ${added}` }
}
