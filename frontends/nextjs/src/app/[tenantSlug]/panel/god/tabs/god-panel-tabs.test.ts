import { describe, expect, it } from 'vitest'

import { godPanelConfig } from '@/lib/packages/navigation'
import { TAB_COMPONENTS } from './god-panel-tabs'

/**
 * The nav config and the component map are two lists that have to agree.
 * They are joined by id at render time, and a tab named in the config
 * with nothing to render answers "Tab X is not yet implemented" -- in
 * the panel, quietly, for as long as nobody clicks it. A tab shipped
 * with a typo'd id would do the same.
 */
describe('every advertised tab', () => {
  const ids = godPanelConfig.tabs.map(t => t.id)

  it.each(ids)('%s has a component to render', id => {
    expect(TAB_COMPONENTS).toHaveProperty(id)
  })

  it('has a label and a description a founder can read', () => {
    for (const tab of godPanelConfig.tabs) {
      expect(tab.label.length).toBeGreaterThan(0)
      expect(tab.description.length).toBeGreaterThan(0)
    }
  })

  it('names each tab once', () => {
    expect(new Set(ids).size).toBe(ids.length)
  })
})

/** The other direction: a component nothing routes to is dead code. */
describe('every registered component', () => {
  it.each(Object.keys(TAB_COMPONENTS))('%s is advertised in the nav', id => {
    expect(godPanelConfig.tabs.map(t => t.id)).toContain(id)
  })
})
