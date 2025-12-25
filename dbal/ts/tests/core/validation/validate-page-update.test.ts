import { describe, it, expect } from 'vitest'
import { validatePageUpdate } from '../../../src/core/validation/validate-page-update'

describe('validatePageUpdate', () => {
  it.each([
    { data: {}, expected: [], description: 'no updates' },
    { data: { slug: 'Bad_Slug' }, expected: ['Invalid slug format'], description: 'invalid slug' },
    {
      data: { title: '' },
      expected: ['Invalid title (must be 1-200 characters)'],
      description: 'invalid title',
    },
    { data: { level: 6 }, expected: ['Invalid level (must be 0-5)'], description: 'invalid level' },
    {
      data: { slug: 'valid-slug', title: 'Valid title', level: 2 },
      expected: [],
      description: 'valid updates',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validatePageUpdate(data)).toEqual(expected)
  })
})
