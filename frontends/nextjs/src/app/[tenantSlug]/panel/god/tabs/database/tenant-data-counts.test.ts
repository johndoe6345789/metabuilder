import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  collectionLabel,
  countLabel,
  countTenantData,
  COUNT_LIMIT,
} from './tenant-data-counts'

afterEach(() => vi.unstubAllGlobals())

const answers = (rows: unknown[], ok = true) => {
  const seen: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      seen.push(String(url))
      return { ok, json: async () => ({ data: { data: rows } }) }
    })
  )
  return seen
}

describe('collectionLabel', () => {
  it.each([
    ['users', 'Users'],
    ['formSubmissions', 'Form submissions'],
    ['pageTreeNodes', 'Page tree nodes'],
  ])('reads %p as %p', (key, expected) => {
    expect(collectionLabel(key)).toBe(expected)
  })
})

describe('countLabel', () => {
  const base = { key: 'users', path: 'core/User', more: false }

  it('shows the count', () => {
    expect(countLabel({ ...base, rows: 3 })).toBe('3')
  })

  it('shows a table bigger than the limit as "N+"', () => {
    expect(countLabel({ ...base, rows: 500, more: true })).toBe('500+')
  })

  /** An unreadable collection is not an empty one, and telling them
   *  apart is the whole point of showing this. */
  it('says so when it could not be read', () => {
    expect(countLabel({ ...base, rows: null })).toBe('could not read')
  })
})

describe('countTenantData', () => {
  it("counts this community's own rows", async () => {
    const seen = answers([{ id: 'a' }, { id: 'b' }])

    const counts = await countTenantData('harbour')

    expect(seen.every(u => u.includes('/harbour/'))).toBe(true)
    expect(seen.some(u => u.includes('/system/'))).toBe(false)
    expect(counts.every(c => c.rows === 2)).toBe(true)
  })

  it('covers every collection the export writes', async () => {
    answers([])
    const counts = await countTenantData('harbour')
    expect(counts.map(c => c.key)).toContain('formSubmissions')
    expect(counts.map(c => c.key)).toContain('pageTreeProps')
    expect(counts).toHaveLength(14)
  })

  it('marks a full page as there being more', async () => {
    answers(Array.from({ length: COUNT_LIMIT }, (_, i) => ({ id: i })))
    const counts = await countTenantData('harbour')
    expect(counts[0].more).toBe(true)
  })

  it('records a refusal as unreadable, not as empty', async () => {
    answers([], false)
    const counts = await countTenantData('harbour')
    expect(counts.every(c => c.rows === null)).toBe(true)
  })

  it('records an unreachable data layer the same way', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch')))
    )
    const counts = await countTenantData('harbour')
    expect(counts.every(c => c.rows === null)).toBe(true)
  })
})
