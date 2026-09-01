import { describe, expect, it } from 'vitest'
import { NODE_TYPES } from '@/workflow-editor'
import { filterNodeTypes } from './filter-node-types'

describe('filterNodeTypes', () => {
  it('returns the full catalogue for an empty query', () => {
    expect(filterNodeTypes('')).toEqual(NODE_TYPES)
  })

  it('matches by name, case-insensitively', () => {
    const target = NODE_TYPES[0]
    const result = filterNodeTypes(target.name.toUpperCase())
    expect(result).toContainEqual(target)
  })

  it('matches by description', () => {
    const target = NODE_TYPES.find(n => n.description.length > 0)
    if (target === undefined) return
    const word = target.description.split(' ')[0]
    const result = filterNodeTypes(word)
    expect(result).toContainEqual(target)
  })

  it('returns nothing for a query that matches no node type', () => {
    expect(filterNodeTypes('zzz-not-a-real-node-zzz')).toEqual([])
  })
})
