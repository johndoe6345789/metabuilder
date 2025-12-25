import { describe, expect, it } from 'vitest'
import { validatePageUpdate } from './validate-page-update'

describe('validatePageUpdate', () => {
  it.each([
    { data: { title: 'Updated' } },
    { data: { level: 5 } },
  ])('accepts %s', ({ data }) => {
    expect(validatePageUpdate(data)).toEqual([])
  })

  it.each([
    { data: { slug: 'Bad Slug' }, message: 'Invalid slug format (lowercase alphanumeric, hyphen, slash, 1-255 chars)' },
    { data: { layout: [] }, message: 'Layout must be an object' },
    { data: { isActive: 'no' as unknown as boolean }, message: 'isActive must be a boolean' },
  ])('rejects %s', ({ data, message }) => {
    expect(validatePageUpdate(data)).toContain(message)
  })
})
