/** Identity, class and aria props applied to every block, not just the ones
 * whose own render() happens to read them. */

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
