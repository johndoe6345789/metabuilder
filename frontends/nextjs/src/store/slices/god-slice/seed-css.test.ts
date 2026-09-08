import { describe, expect, it } from 'vitest'

import { SEED_CSS } from './seed-css'

/**
 * The seeded `card` was a dark-palette card -- #161b22 on a #30363d
 * border, from a GitHub-dark mockup -- with no text colour of its own. On
 * the light theme every new community starts on, that is near-black text
 * on a near-black box, and the Styles tab's own contrast check flagged
 * the first class a founder ever opened as "Hard to read". Theme tokens
 * follow the tenant's colours and the viewer's light/dark mode instead.
 */
describe('SEED_CSS', () => {
  const byName = Object.fromEntries(SEED_CSS.map(c => [c.name, c.props]))

  it('ships a card and a pill', () => {
    expect(Object.keys(byName).sort()).toEqual(['card', 'pill'])
  })

  it('paints the card with theme tokens, not a fixed dark palette', () => {
    expect(byName.card.background).toBe('var(--mat-sys-surface-container)')
    expect(byName.card.color).toBe('var(--mat-sys-on-surface)')
    expect(byName.card.border).toContain('var(--mat-sys-outline-variant)')
  })

  it('paints the pill with the brand colour and its text colour', () => {
    expect(byName.pill.background).toBe('var(--mat-sys-primary)')
    expect(byName.pill.color).toBe('var(--mat-sys-on-primary)')
  })

  it('carries no hex colour anywhere, so it survives a theme change', () => {
    const values = SEED_CSS.flatMap(c => Object.values(c.props))
    expect(values.filter(v => /#[0-9a-f]{3,8}\b/i.test(v))).toEqual([])
  })
})
