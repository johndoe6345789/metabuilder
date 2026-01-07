import { describe, expect, it } from 'vitest'
import { validateWorkflowUpdate } from '../../../src/core/validation/validate-workflow-update'

describe('validateWorkflowUpdate', () => {
  it.each([
    { data: { name: 'Updated' }, expected: [] },
    { data: { enabled: false }, expected: [] },
    { data: { nodes: '[]' }, expected: [] },
  ])('returns $expected for valid case', ({ data, expected }) => {
    expect(validateWorkflowUpdate(data)).toEqual(expected)
  })

  it.each([
    { data: { nodes: 'not-json' }, message: 'nodes must be a JSON string' },
    { data: { edges: 'not-json' }, message: 'edges must be a JSON string' },
    { data: { enabled: 'yes' as unknown as boolean }, message: 'enabled must be a boolean' },
    { data: { version: 0 }, message: 'version must be a positive integer' },
    { data: { updatedAt: 'not-a-bigint' }, message: 'updatedAt must be a bigint timestamp' },
  ])('rejects invalid case', ({ data, message }) => {
    expect(validateWorkflowUpdate(data)).toContain(message)
  })
})
