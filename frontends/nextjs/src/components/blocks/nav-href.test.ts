import { describe, expect, it } from 'vitest'

import { navBaseFromPathname, resolveNavHref } from './nav-href'

const BASE = '/app/harbour_cycle_works'

describe('resolveNavHref', () => {
  // The bug: a three-page site published at /, /workshop and /visit
  // rendered every nav link against the origin, so each one 404'd.
  it('points a site-relative link at the tenant that owns it', () => {
    expect(resolveNavHref('/workshop', BASE)).toBe(
      '/app/harbour_cycle_works/workshop'
    )
  })

  it('sends the home link to the site root, without a trailing slash', () => {
    expect(resolveNavHref('/', BASE)).toBe('/app/harbour_cycle_works')
  })

  it.each([
    'https://example.com/parts',
    'http://example.com',
    'mailto:shop@example.com',
    'tel:+441234567890',
    '#opening-hours',
    '//cdn.example.com/x',
  ])('leaves %s exactly as written', href => {
    expect(resolveNavHref(href, BASE)).toBe(href)
  })

  it('leaves a relative link to resolve against the current page', () => {
    expect(resolveNavHref('workshop', BASE)).toBe('workshop')
  })

  // Guessing a prefix would send every link somewhere wrong; writing none
  // leaves the previous behaviour, which is at least predictable.
  it('changes nothing when the site root is unknown', () => {
    expect(resolveNavHref('/workshop', '')).toBe('/workshop')
  })

  it('keeps an empty href empty rather than making it the site root', () => {
    expect(resolveNavHref('  ', BASE)).toBe('')
  })
})

describe('navBaseFromPathname', () => {
  it('reads the tenant off a published page', () => {
    expect(navBaseFromPathname('/harbour_cycle_works/workshop', '/app')).toBe(
      '/app/harbour_cycle_works'
    )
  })

  // The builder preview renders the same tree from inside the God Panel,
  // where a link should still point at the real published page.
  it('reads the tenant off a God Panel page', () => {
    expect(navBaseFromPathname('/harbour_cycle_works/panel/god/bql', '/app')).toBe(
      '/app/harbour_cycle_works'
    )
  })

  it('has no base at the root, so links are left alone', () => {
    expect(navBaseFromPathname('/', '/app')).toBe('')
  })
})

it('has no base when there is no path at all', () => {
  // usePathname() answers null outside a router.
  expect(navBaseFromPathname(null, '/app')).toBe('')
})
