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

describe('previewTarget', () => {
  it.each([
    [1, 'https://x.test/app/'],
    [2, 'https://x.test/app/profile'],
    [3, 'https://x.test/app/admin'],
  ])('sends level %i to %s', (level, expected) => {
    expect(previewTarget('https://x.test', level)).toBe(expected)
  })

  // Levels 4 and 5 are the god and supergod panels, which the operator is
  // already inside; there is no preview to send them to.
  it.each([0, 4, 5, 99])('has no target for level %i', level => {
    expect(previewTarget('https://x.test', level)).toBeNull()
  })

  it('always includes the app base path', () => {
    expect(previewTarget('https://x.test', 1)).toContain('/app')
  })
})
