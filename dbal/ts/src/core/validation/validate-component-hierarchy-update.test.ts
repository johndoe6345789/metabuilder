import { describe, expect, it } from 'vitest'
import { validateComponentHierarchyUpdate } from './validate-component-hierarchy-update'

describe('validateComponentHierarchyUpdate', () => {
  it.each([
    { data: { order: 2 } },
    { data: { componentType: 'Header' } },
  ])('accepts %s', ({ data }) => {
    expect(validateComponentHierarchyUpdate(data)).toEqual([])
  })

  it.each([
    { data: { pageId: 'not-a-uuid' }, message: 'pageId must be a valid UUID' },
    { data: { order: 1.5 }, message: 'order must be a non-negative integer' },
    { data: { props: [] }, message: 'props must be an object' },
  ])('rejects %s', ({ data, message }) => {
    expect(validateComponentHierarchyUpdate(data)).toContain(message)
  })
})
