import { describe, it, expect } from 'vitest'
import { validatePageCreate } from '../../../src/core/validation/validate-page-create'

const tooLongTitle = 'a'.repeat(256)

describe('validatePageCreate', () => {
  it.each([
    {
      data: {},
      expected: ['Slug is required', 'Title is required', 'Level is required', 'Layout is required', 'isActive is required'],
      description: 'missing required fields',
    },
    {
      data: { slug: 'Bad_Slug', title: 'Valid title', level: 1 },
      expected: ['Invalid slug format (lowercase alphanumeric, hyphen, slash, 1-255 chars)'],
      description: 'invalid slug format',
    },
    {
      data: { slug: 'valid-slug', title: tooLongTitle, level: 1 },
      expected: ['Invalid title (must be 1-255 characters)'],
      description: 'title too long',
    },
    {
      data: { slug: 'valid-slug', title: 'Valid title', level: 6 },
      expected: ['Invalid level (must be 1-5)'],
      description: 'invalid level',
    },
    {
      data: { slug: 'valid-slug', title: 'Valid title', level: 1, layout: {}, isActive: true },
      expected: [],
      description: 'valid payload',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validatePageCreate(data)).toEqual(expected)
  })
})
