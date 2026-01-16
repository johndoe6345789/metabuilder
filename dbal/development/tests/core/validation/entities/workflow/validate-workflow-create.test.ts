import { describe, expect, it } from 'vitest'
import { validateWorkflowCreate } from '../../../../../src/core/validation/validate-workflow-create'

describe('validateWorkflowCreate', () => {
  const base = {
    name: 'Daily Sync',
    nodes: '[]',
    edges: '[]',
    enabled: true,
    createdBy: 'user-1',
  }

  it.each([
    { data: base, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateWorkflowCreate(data)).toEqual(expected)
  })

  it.each([
    { data: { ...base, nodes: 'not-json' }, message: 'nodes must be a JSON string' },
    { data: { ...base, edges: 'not-json' }, message: 'edges must be a JSON string' },
    { data: { ...base, enabled: 'yes' as unknown as boolean }, message: 'enabled must be a boolean' },
    { data: { ...base, version: 0 }, message: 'version must be a positive integer' },
    { data: { ...base, createdAt: 'not-a-bigint' }, message: 'createdAt must be a bigint timestamp' },
    { data: { ...base, name: 'a'.repeat(256) }, message: 'name must be 1-255 characters' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateWorkflowCreate(data)).toContain(message)
  })
})
