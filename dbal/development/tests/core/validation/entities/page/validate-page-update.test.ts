import { describe, it, expect } from 'vitest'
import { validatePageUpdate } from '../../../../../src/core/validation/validate-page-update'

describe('validatePageUpdate', () => {
  it.each([
    { data: {}, expected: [], description: 'no updates' },
    {
      data: { path: '' },
      expected: ['path must be 1-255 characters'],
      description: 'invalid path',
    },
    {
      data: { title: '' },
      expected: ['Invalid title (must be 1-255 characters)'],
      description: 'invalid title',
    },
    { data: { componentTree: 'not-json' }, expected: ['componentTree must be a JSON string'], description: 'invalid componentTree' },
    { data: { level: 7 }, expected: ['level must be between 1 and 6'], description: 'invalid level' },
    { data: { requiresAuth: 'yes' as unknown as boolean }, expected: ['requiresAuth must be a boolean'], description: 'invalid requiresAuth' },
    { data: { isPublished: 'yes' as unknown as boolean }, expected: ['isPublished must be a boolean'], description: 'invalid isPublished' },
    {
      data: { path: '/home', title: 'Valid title', componentTree: '[]', level: 2, requiresAuth: true },
      expected: [],
      description: 'valid updates',
    },
  ])('returns expected errors for $description', ({ data, expected }) => {
    expect(validatePageUpdate(data)).toEqual(expected)
  })
})
