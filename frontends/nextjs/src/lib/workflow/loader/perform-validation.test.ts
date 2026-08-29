import { afterEach, describe, expect, it, vi } from 'vitest'

import { performValidation } from './perform-validation'

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

afterEach(() => vi.restoreAllMocks())

/** A clock that advances a fixed amount between the two reads. */
const clock = (elapsed: number) => {
  let calls = 0
  return () => (calls++ === 0 ? 0 : elapsed)
}

describe('performValidation', () => {
  it('passes a sound workflow', () => {
    const result = performValidation(workflow(), false)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('reports how long it took', () => {
    expect(performValidation(workflow(), false, clock(7))._validationTime).toBe(
      7
    )
  })

  it('fails a workflow with no nodes, without throwing', () => {
    const result = performValidation(workflow({ nodes: [] }), false)
    expect(result.valid).toBe(false)
    expect(result.errors[0]?.message).toContain('at least one node')
  })

  it('times a failure too', () => {
    const result = performValidation(workflow({ nodes: [] }), false, clock(3))
    expect(result._validationTime).toBe(3)
  })

  it('marks a failure at the root with the rule code', () => {
    expect(
      performValidation(workflow({ tenantId: '' }), false).errors[0]
    ).toMatchObject({ path: 'root', code: 'VALIDATION_FAILED' })
  })

  it('logs the shape of a workflow it passed, when asked', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    performValidation(workflow(), true)
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0]?.[1]).toMatchObject({ nodeCount: 1 })
  })

  it('stays quiet when logging is off', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    performValidation(workflow(), false)
    expect(warn).not.toHaveBeenCalled()
  })

  // A failed validation is always logged: it is the thing an operator is
  // looking for, and the flag only governs the chatter around it.
  it('reports a failure regardless of the logging flag', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    performValidation(workflow({ nodes: [] }), false)
    expect(error).toHaveBeenCalledOnce()
  })
})
