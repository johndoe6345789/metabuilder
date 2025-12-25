import { describe, it, expect } from 'vitest'
import { validatePageCreate } from './validate-page-create'

describe('validatePageCreate', () => {
  it.each([
    {
      name: 'missing fields',
      data: {},
      expected: ['Slug is required', 'Title is required', 'Level is required'],
    },
    {
      name: 'invalid fields',
      data: {
        slug: 'Bad Slug',
        title: 'a'.repeat(201),
        level: 6,
      },
      expected: [
        'Invalid slug format (lowercase alphanumeric with hyphens, 1-100 chars)',
        'Invalid title (must be 1-200 characters)',
        'Invalid level (must be 0-5)',
      ],
    },
    {
      name: 'valid fields',
      data: { slug: 'good-slug', title: 'Title', level: 1 },
      expected: [],
    },
  ])('returns errors for $name', ({ data, expected }) => {
    expect(validatePageCreate(data)).toEqual(expected)
  })
})
