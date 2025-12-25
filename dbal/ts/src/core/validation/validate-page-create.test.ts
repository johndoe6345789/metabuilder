import { describe, expect, it } from 'vitest'
import { validatePageCreate } from './validate-page-create'

describe('validatePageCreate', () => {
  const base = {
    slug: 'docs/getting-started',
    title: 'Docs',
    level: 1,
    layout: { sections: [] },
    isActive: true,
  }

  it.each([
    { data: base },
  ])('accepts %s', ({ data }) => {
    expect(validatePageCreate(data)).toEqual([])
  })

  it.each([
    { data: { ...base, slug: 'Bad Slug' }, message: 'Invalid slug format (lowercase alphanumeric, hyphen, slash, 1-255 chars)' },
    { data: { ...base, level: 0 }, message: 'Invalid level (must be 1-5)' },
    { data: { ...base, layout: [] }, message: 'Layout must be an object' },
    { data: { ...base, isActive: 'yes' as unknown as boolean }, message: 'isActive must be a boolean' },
  ])('rejects %s', ({ data, message }) => {
    expect(validatePageCreate(data)).toContain(message)
  })
})
