import { describe, it, expect } from 'vitest'
import { validatePageUpdate } from '../../../src/core/validation/validate-page-update'

describe('validatePageUpdate', () => {
  it.each([
    { data: {}, expected: [], description: 'no updates' },
    {
      data: { slug: 'Bad_Slug' },
      expected: ['Invalid slug format (lowercase alphanumeric, hyphen, slash, 1-255 chars)'],
      description: 'invalid slug',
    },
    {
      data: { title: '' },
      expected: ['Invalid title (must be 1-255 characters)'],
      description: 'invalid title',
    },
    { data: { level: 6 }, expected: ['Invalid level (must be 1-5)'], description: 'invalid level' },
    { data: { layout: [] }, expected: ['Layout must be an object'], description: 'invalid layout' },
    { data: { isActive: 'yes' as unknown as boolean }, expected: ['isActive must be a boolean'], description: 'invalid active' },
    {
      data: { slug: 'valid-slug', title: 'Valid title', level: 2 },
      expected: [],
      description: 'valid updates',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validatePageUpdate(data)).toEqual(expected)
  })
})
