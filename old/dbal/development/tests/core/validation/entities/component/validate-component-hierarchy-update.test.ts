import { describe, expect, it } from 'vitest'
import { validateComponentHierarchyUpdate } from '../../../src/core/validation/validate-component-hierarchy-update'

describe('validateComponentHierarchyUpdate', () => {
  it.each([
    { data: { order: 2 }, expected: [] },
    { data: { type: 'Header' }, expected: [] },
    { data: { childIds: '[]' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateComponentHierarchyUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { pageId: ' ' }, message: 'pageId must be a non-empty string' },
    { data: { order: 1.5 }, message: 'order must be a non-negative integer' },
    { data: { childIds: 'not-json' }, message: 'childIds must be a JSON string' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateComponentHierarchyUpdate(data)).toContain(message)
  })
})
