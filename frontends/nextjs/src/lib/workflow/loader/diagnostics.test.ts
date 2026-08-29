import { describe, expect, it } from 'vitest'

import { buildDiagnostics } from './diagnostics'

const workflow = {
  id: 'wf1',
  tenantId: 'acme',
  nodes: [{ id: 'n1' }, { id: 'n2' }],
  connections: { n1: {} },
  triggers: [{ nodeId: 'n1' }],
  variables: { a: {}, b: {} },
} as never

const error = (i: number) =>
  ({ path: `p${i}`, message: `e${i}`, severity: 'error', code: 'X' }) as never

const validation = (over = {}) =>
  ({
    valid: true,
    errors: [],
    warnings: [],
    ...over,
  }) as never

describe('buildDiagnostics', () => {
  it('counts each part of the workflow', () => {
    expect(buildDiagnostics(workflow, validation())).toMatchObject({
      workflowId: 'wf1',
      tenantId: 'acme',
      nodeCount: 2,
      connectionCount: 1,
      triggerCount: 1,
      variableCount: 2,
    })
  })

  it('summarises the validation', () => {
    const diagnostics = buildDiagnostics(
      workflow,
      validation({ valid: false, errors: [error(1)], warnings: [error(2)] })
    )
    expect(diagnostics.validation).toMatchObject({
      valid: false,
      errorCount: 1,
      warningCount: 1,
    })
  })

  // A workflow with a hundred problems produces a readable summary, not a
  // hundred-entry payload.
  it('reports only the first five errors and warnings', () => {
    const many = Array.from({ length: 12 }, (_, i) => error(i))
    const diagnostics = buildDiagnostics(
      workflow,
      validation({ errors: many, warnings: many })
    )
    expect(diagnostics.validation.topErrors).toHaveLength(5)
    expect(diagnostics.validation.topWarnings).toHaveLength(5)
    expect(diagnostics.validation.errorCount).toBe(12)
  })

  it('reports the timing and cache metrics', () => {
    expect(
      buildDiagnostics(
        workflow,
        validation({ _validationTime: 7, _cacheHit: true })
      ).metrics
    ).toEqual({ validationTimeMs: 7, cacheHit: true })
  })

  it('reports zero and a miss when the metrics are absent', () => {
    expect(buildDiagnostics(workflow, validation()).metrics).toEqual({
      validationTimeMs: 0,
      cacheHit: false,
    })
  })
})
