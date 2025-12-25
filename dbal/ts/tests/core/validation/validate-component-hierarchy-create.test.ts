import { describe, expect, it } from 'vitest'
import { validateComponentHierarchyCreate } from '../../../src/core/validation/validate-component-hierarchy-create'

describe('validateComponentHierarchyCreate', () => {
  const base = {
    pageId: '550e8400-e29b-41d4-a716-446655440000',
    componentType: 'Hero',
    order: 0,
    props: { title: 'Hello' },
  }

  it.each([
    { data: base, expected: [] },
    { data: { ...base, parentId: '00000000-0000-0000-0000-000000000000' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateComponentHierarchyCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, pageId: 'not-a-uuid' }, message: 'pageId must be a valid UUID' },
    { data: { ...base, componentType: 'a'.repeat(101) }, message: 'componentType must be 1-100 characters' },
    { data: { ...base, order: -1 }, message: 'order must be a non-negative integer' },
    { data: { ...base, props: [] }, message: 'props must be an object' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateComponentHierarchyCreate(data)).toContain(message)
  })
})
