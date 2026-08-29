import { describe, expect, it } from 'vitest'

import { cacheKeyFor, hashWorkflow } from './workflow-hash'

const workflow = (over: Record<string, unknown> = {}) =>
  ({
    id: 'wf1',
    tenantId: 'acme',
    nodes: [{ id: 'n1', name: 'n1', nodeType: 'action' }],
    connections: {},
    variables: {},
    triggers: [],
    ...over,
  }) as never

describe('hashWorkflow', () => {
  it('is stable for the same definition', () => {
    expect(hashWorkflow(workflow())).toBe(hashWorkflow(workflow()))
  })

  it('is a hex string', () => {
    expect(hashWorkflow(workflow())).toMatch(/^[0-9a-f]+$/)
  })

  it.each([
    ['nodes', { nodes: [{ id: 'n2', name: 'n2', nodeType: 'action' }] }],
    ['connections', { connections: { n1: {} } }],
    ['variables', { variables: { v: { scope: 'workflow' } } }],
    ['triggers', { triggers: [{ nodeId: 'n1', kind: 'manual' }] }],
  ])('changes when %s change', (_label, over) => {
    expect(hashWorkflow(workflow(over))).not.toBe(hashWorkflow(workflow()))
  })

  // A run count or a saved-at timestamp must not invalidate a validation
  // that is still correct.
  it.each([
    ['an execution count', { executionCount: 42 }],
    ['an updated timestamp', { updatedAt: 1700000000000 }],
    ['a name', { name: 'renamed' }],
  ])('ignores %s', (_label, over) => {
    expect(hashWorkflow(workflow(over))).toBe(hashWorkflow(workflow()))
  })
})

describe('cacheKeyFor', () => {
  it('puts the tenant first, so a prefix scan is per tenant', () => {
    expect(cacheKeyFor(workflow())).toMatch(/^acme:wf1:/)
  })

  it('separates the same workflow id in two tenants', () => {
    expect(cacheKeyFor(workflow())).not.toBe(
      cacheKeyFor(workflow({ tenantId: 'other' }))
    )
  })

  it('changes when the definition changes', () => {
    expect(cacheKeyFor(workflow())).not.toBe(
      cacheKeyFor(workflow({ connections: { n1: {} } }))
    )
  })
})
