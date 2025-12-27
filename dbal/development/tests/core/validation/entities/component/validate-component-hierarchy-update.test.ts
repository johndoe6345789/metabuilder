import { describe, expect, it } from 'vitest'
import { validateComponentHierarchyUpdate } from '../../../src/core/validation/validate-component-hierarchy-update'

describe('validateComponentHierarchyUpdate', () => {
  it.each([
    { data: { order: 2 }, expected: [] },
    { data: { componentType: 'Header' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateComponentHierarchyUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { pageId: 'not-a-uuid' }, message: 'pageId must be a valid UUID' },
    { data: { order: 1.5 }, message: 'order must be a non-negative integer' },
    { data: { props: [] }, message: 'props must be an object' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateComponentHierarchyUpdate(data)).toContain(message)
  })
})
