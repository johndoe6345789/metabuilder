import { describe, expect, it } from 'vitest'

import {
  normalizeTenant,
  previewUrl,
  publishCounts,
  SYSTEM_TENANT,
} from './page-routes-logic'

describe('normalizeTenant', () => {
  it('keeps a real tenant name', () => {
    expect(normalizeTenant('acme')).toBe('acme')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeTenant('  acme  ')).toBe('acme')
  })

  it.each(['', '   '])('falls back to system for %p', input => {
    expect(normalizeTenant(input)).toBe(SYSTEM_TENANT)
  })
})

describe('previewUrl', () => {
  const origin = 'https://app.example.com'

  it('resolves a relative path under the tenant workspace', () => {
    expect(previewUrl({ path: '/blog' }, 'acme', origin)).toBe(
      'https://app.example.com/app/acme/blog'
    )
  })

  it('adds the leading slash a stored path is missing', () => {
    expect(previewUrl({ path: 'blog' }, 'acme', origin)).toBe(
      'https://app.example.com/app/acme/blog'
    )
  })

  // An external page's path is a full URL, not a route on this workspace,
  // so it opens as-is rather than being nested under /app/{tenant}.
  it('opens an http(s) path as-is, unresolved', () => {
    expect(previewUrl({ path: 'https://elsewhere.example/x' }, 'acme', origin)).toBe(
      'https://elsewhere.example/x'
    )
  })

  it('scopes to the tenant that was asked for', () => {
    expect(previewUrl({ path: '/x' }, 'other-tenant', origin)).toContain(
      '/other-tenant/'
    )
  })
})

describe('publishCounts', () => {
  it('counts live and draft separately', () => {
    expect(
      publishCounts([
        { isPublished: true },
        { isPublished: true },
        { isPublished: false },
      ])
    ).toEqual({ live: 2, draft: 1 })
  })

  it('is all zero for no pages', () => {
    expect(publishCounts([])).toEqual({ live: 0, draft: 0 })
  })

  it('is all draft when nothing is published', () => {
    expect(publishCounts([{ isPublished: false }])).toEqual({
      live: 0,
      draft: 1,
    })
  })
})
