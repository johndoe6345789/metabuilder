import { describe, expect, it } from 'vitest'
import { validateComponentHierarchyCreate } from '../../../src/core/validation/validate-component-hierarchy-create'

describe('validateComponentHierarchyCreate', () => {
  const base = {
    pageId: 'page-1',
    type: 'Hero',
    order: 0,
    childIds: '[]',
  }

  it.each([
    { data: base, expected: [] },
    { data: { ...base, parentId: '00000000-0000-0000-0000-000000000000' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateComponentHierarchyCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, pageId: ' ' }, message: 'pageId must be a non-empty string' },
    { data: { ...base, type: 'a'.repeat(101) }, message: 'type must be 1-100 characters' },
    { data: { ...base, childIds: 'not-json' }, message: 'childIds must be a JSON string' },
    { data: { ...base, order: -1 }, message: 'order must be a non-negative integer' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateComponentHierarchyCreate(data)).toContain(message)
  })
})
