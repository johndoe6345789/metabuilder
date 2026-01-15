import { describe, it, expect } from 'vitest'
import { validatePageCreate } from '../../../../../src/core/validation/validate-page-create'

const tooLongTitle = 'a'.repeat(256)

describe('validatePageCreate', () => {
  it.each([
    {
      data: {},
      expected: ['path is required', 'Title is required', 'componentTree is required', 'level is required', 'requiresAuth is required'],
      description: 'missing required fields',
    },
    {
      data: { path: 'a'.repeat(256), title: 'Valid title', componentTree: '[]', level: 1, requiresAuth: true },
      expected: ['path must be 1-255 characters'],
      description: 'invalid path',
    },
    {
      data: { path: '/home', title: tooLongTitle, componentTree: '[]', level: 1, requiresAuth: true },
      expected: ['Invalid title (must be 1-255 characters)'],
      description: 'title too long',
    },
    {
      data: { path: '/home', title: 'Valid title', componentTree: 'not-json', level: 1, requiresAuth: true },
      expected: ['componentTree must be a JSON string'],
      description: 'invalid componentTree',
    },
    {
      data: { path: '/home', title: 'Valid title', componentTree: '[]', level: 7, requiresAuth: true },
      expected: ['level must be between 1 and 6'],
      description: 'invalid level',
    },
    {
      data: { path: '/home', title: 'Valid title', componentTree: '[]', level: 1, requiresAuth: true },
      expected: [],
      description: 'valid payload',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validatePageCreate(data)).toEqual(expected)
  })
})
