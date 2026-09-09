import { describe, expect, it } from 'vitest'

import { PREVIEW_LEVELS, previewLevelHref } from './preview-level-links'

/**
 * The tab hard-coded '/', '/dashboard' and '/admin'. Under basePath
 * '/app' the first is the marketing page and the other two are read by
 * Next as tenants called "dashboard" and "admin", so they 404 -- three of
 * this tab's four cards went nowhere. The same table had already been
 * fixed in three other places.
 */
describe('previewLevelHref', () => {
  it('sends level 1 into the community, not the marketing page', () => {
    expect(previewLevelHref('acme', 1)).toBe('/acme')
  })

  it.each([
    [2, '/acme/panel/profile'],
    [3, '/acme/panel/admin'],
  ])('keeps level %i inside the community', (level, expected) => {
    expect(previewLevelHref('acme', level)).toBe(expected)
  })

  it('sends level 4 to this community’s God Panel', () => {
    expect(previewLevelHref('acme', 4)).toBe('/acme/panel/god')
  })

  it.each([1, 2, 3, 4])('never leaves the community for level %i', level => {
    expect(previewLevelHref('acme', level).startsWith('/acme')).toBe(true)
  })

  it.each([1, 2, 3, 4])('never doubles the base path for level %i', level => {
    expect(previewLevelHref('acme', level)).not.toContain('/app/')
  })

  it('offers all four levels', () => {
    expect(PREVIEW_LEVELS.map(l => l.level)).toEqual([1, 2, 3, 4])
  })
})
