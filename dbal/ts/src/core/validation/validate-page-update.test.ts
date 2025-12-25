import { describe, it, expect } from 'vitest'
import { validatePageUpdate } from './validate-page-update'

describe('validatePageUpdate', () => {
  it.each([
    { name: 'empty', data: {}, expected: [] },
    {
      name: 'invalid slug',
      data: { slug: 'Bad Slug' },
      expected: ['Invalid slug format'],
    },
    {
      name: 'invalid title',
      data: { title: '' },
      expected: ['Invalid title (must be 1-200 characters)'],
    },
    {
      name: 'invalid level',
      data: { level: 6 },
      expected: ['Invalid level (must be 0-5)'],
    },
    {
      name: 'multiple invalid',
      data: { slug: 'Bad Slug', title: '', level: 6 },
      expected: [
        'Invalid slug format',
        'Invalid title (must be 1-200 characters)',
        'Invalid level (must be 0-5)',
      ],
    },
  ])('returns errors for $name', ({ data, expected }) => {
    expect(validatePageUpdate(data)).toEqual(expected)
  })
})
