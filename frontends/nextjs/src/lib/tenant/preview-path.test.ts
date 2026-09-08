import { describe, expect, it } from 'vitest'

import { previewPathForLevel } from './workspace-paths'

/**
 * Three copies of this table hard-coded '/', '/profile' and '/admin'. Under
 * basePath '/app' the last two resolved to /app/profile and /app/admin --
 * matched as tenants named "profile" and "admin", refused, 404 -- and '/'
 * is the MetaBuilder marketing page, not the founder's site. "Home" in the
 * builder's own header left the product; every Preview button on the
 * first tab a founder lands on was dead.
 */
describe('where a preview level sends the founder', () => {
  it('sends level 1 to their published site, not the marketing page', () => {
    expect(previewPathForLevel('acme', 1)).toBe('/acme')
  })

  it('keeps the profile and admin previews inside the community', () => {
    expect(previewPathForLevel('acme', 2)).toBe('/acme/panel/profile')
    expect(previewPathForLevel('acme', 3)).toBe('/acme/panel/admin')
  })

  it('has nowhere to send a level with no page', () => {
    expect(previewPathForLevel('acme', 7)).toBeNull()
  })

  // The router adds the basePath itself, so these must not carry it.
  it('never bakes the basePath in', () => {
    for (const level of [1, 2, 3]) {
      expect(previewPathForLevel('acme', level)?.startsWith('/app')).toBe(
        false
      )
    }
  })
})
