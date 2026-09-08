import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/app' }))

import { previewTarget, toolLevel } from './preview-targets'

describe('toolLevel', () => {
  it('reads the level a tool asks for', () => {
    expect(toolLevel({ level: 3 })).toBe(3)
  })

  it.each([undefined, {}, { level: '3' }, { level: null }])(
    'falls back to the public site for %p',
    params => {
      expect(toolLevel(params as Record<string, unknown>)).toBe(1)
    }
  )
})

/**
 * These sent level 1 to https://x.test/app/ -- the MetaBuilder marketing
 * page, not the founder's site -- and levels 2 and 3 to /app/profile and
 * /app/admin, which Next matches as tenants named "profile" and "admin",
 * refuses, and 404s. Every Preview card on the first tab a founder lands
 * on was dead. The targets live inside the community now.
 */
describe('previewTarget', () => {
  it.each([
    [1, 'https://x.test/app/acme'],
    [2, 'https://x.test/app/acme/panel/profile'],
    [3, 'https://x.test/app/acme/panel/admin'],
  ])('sends level %i to %s', (level, expected) => {
    expect(previewTarget('https://x.test', level, 'acme')).toBe(expected)
  })

  // Levels 4 and 5 are the god and supergod panels, which the operator is
  // already inside; there is no preview to send them to.
  it.each([0, 4, 5, 99])('has no target for level %i', level => {
    expect(previewTarget('https://x.test', level, 'acme')).toBeNull()
  })

  // window.location.assign does not add the basePath the way the router
  // does, so the absolute URL has to carry it.
  it('always includes the app base path', () => {
    expect(previewTarget('https://x.test', 1, 'acme')).toContain('/app/')
  })

  it('never points at the marketing page', () => {
    expect(previewTarget('https://x.test', 1, 'acme')).not.toBe(
      'https://x.test/app/'
    )
  })
})
