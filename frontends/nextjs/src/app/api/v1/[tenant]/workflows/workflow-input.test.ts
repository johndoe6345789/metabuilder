import { describe, expect, it } from 'vitest'

import { buildWorkflowRecord, validateWorkflowInput } from './workflow-input'

const context = {
  tenant: 'acme',
  createdBy: 'u1',
  id: 'wf-1',
  now: new Date('2026-01-01T00:00:00.000Z'),
}

describe('validateWorkflowInput', () => {
  it('accepts a valid input', () => {
    expect(
      validateWorkflowInput({ name: 'Sync', category: 'automation' })
    ).toEqual([])
  })

  it('requires a name', () => {
    expect(validateWorkflowInput({ category: 'automation' })).toContain(
      'name is required and must be a string'
    )
  })

  it('rejects a non-string name', () => {
    expect(
      validateWorkflowInput({ name: 42, category: 'automation' })
    ).toContain('name is required and must be a string')
  })

  it.each([
    'automation',
    'integration',
    'business-logic',
    'data-transformation',
    'notification',
    'approval',
    'other',
  ])('accepts the category %s', category => {
    expect(validateWorkflowInput({ name: 'x', category })).toEqual([])
  })

  it('rejects a category outside the declared set', () => {
    expect(validateWorkflowInput({ name: 'x', category: 'made-up' })).toEqual([
      'category must be one of: automation, integration, business-logic, etc',
    ])
  })

  it('reports both problems at once', () => {
    expect(validateWorkflowInput({})).toHaveLength(2)
  })
})

describe('buildWorkflowRecord', () => {
  const body = { name: 'Sync', category: 'automation' }

  it('takes id, tenant and author from the context, not the body', () => {
    const record = buildWorkflowRecord(
      { ...body, id: 'attacker-chosen', tenantId: 'other', createdBy: 'x' },
      context
    )
    expect(record.id).toBe('wf-1')
    expect(record.tenantId).toBe('acme')
    expect(record.createdBy).toBe('u1')
  })

  it('defaults active to true', () => {
    expect(buildWorkflowRecord(body, context).active).toBe(true)
  })

  it('honours an explicit active: false', () => {
    expect(
      buildWorkflowRecord({ ...body, active: false }, context).active
    ).toBe(false)
  })

  it('defaults arrays to empty rather than undefined', () => {
    const record = buildWorkflowRecord(body, context)
    expect(record.tags).toEqual([])
    expect(record.nodes).toEqual([])
    expect(record.triggers).toEqual([])
  })

  it('ignores a non-array value for an array field', () => {
    const record = buildWorkflowRecord({ ...body, tags: 'not-an-array' }, context)
    expect(record.tags).toEqual([])
  })

  it('keeps declared array values', () => {
    const record = buildWorkflowRecord(
      { ...body, tags: ['a', 'b'], nodes: [{ id: 'n1' }] },
      context
    )
    expect(record.tags).toEqual(['a', 'b'])
    expect(record.nodes).toEqual([{ id: 'n1' }])
  })

  it('defaults connections and variables to empty objects', () => {
    const record = buildWorkflowRecord(body, context)
    expect(record.connections).toEqual({})
    expect(record.variables).toEqual({})
  })

  it('defaults description to an empty string', () => {
    expect(buildWorkflowRecord(body, context).description).toBe('')
  })

  it('stamps both timestamps from the context clock', () => {
    const record = buildWorkflowRecord(body, context)
    expect(record.createdAt).toBe(context.now)
    expect(record.updatedAt).toBe(context.now)
  })

  it('starts unlocked and versioned 1.0.0', () => {
    const record = buildWorkflowRecord(body, context)
    expect(record.locked).toBe(false)
    expect(record.version).toBe('1.0.0')
  })
})
