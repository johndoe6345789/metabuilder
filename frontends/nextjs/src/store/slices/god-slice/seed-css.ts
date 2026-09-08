import type { CssClass } from '@/app/[tenantSlug]/panel/god/tabs/styles/use-css-classes'

/**
 * The two starter classes every new God Panel project ships with.
 *
 * Theme tokens rather than hex: the card used to be #161b22 on #30363d --
 * a dark-mode mockup's colours -- with no text colour, so on the light
 * theme a new community starts on it was near-black on near-black, and
 * the Styles tab's own contrast check flagged the first class a founder
 * ever opened. Tokens follow the tenant's palette and the viewer's mode,
 * the same values the tab's colour picker stores.
 */
export const SEED_CSS: CssClass[] = [
  {
    id: 'c_card',
    name: 'card',
    props: {
      padding: '16px',
      borderRadius: '16px',
      background: 'var(--mat-sys-surface-container)',
      color: 'var(--mat-sys-on-surface)',
      border: '1px solid var(--mat-sys-outline-variant)',
    },
  },
  {
    id: 'c_pill',
    name: 'pill',
    props: {
      padding: '4px 12px',
      borderRadius: '999px',
      background: 'var(--mat-sys-primary)',
      color: 'var(--mat-sys-on-primary)',
      fontSize: '12px',
      fontWeight: '600',
    },
  },
]
