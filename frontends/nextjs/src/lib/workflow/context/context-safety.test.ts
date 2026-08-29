import { describe, expect, it } from 'vitest'

import {
  assertContextSafe,
  findSafetyErrors,
  isValidUserLevel,
} from './context-safety'
import { defaultExecutionLimits } from './execution-limits'

const workflow = { tenantId: 'acme', executionLimits: undefined }

const context = (over: Record<string, unknown> = {}) =>
  ({
    executionId: 'exec-1',
    tenantId: 'acme',
    user: { id: 'u1', email: 'a@b.c', level: 2 },
    executionLimits: defaultExecutionLimits(),
    ...over,
  }) as never

describe('isValidUserLevel', () => {
  it.each([1, 2, 3, 4])('accepts %i', level => {
    expect(isValidUserLevel(level)).toBe(true)
  })

  it.each([0, 5, -1, NaN, Infinity])('rejects %p', level => {
    expect(isValidUserLevel(level)).toBe(false)
  })
})

describe('findSafetyErrors', () => {
  it('finds nothing wrong with a sound context', () => {
    expect(findSafetyErrors(context(), workflow, {})).toEqual([])
  })

  it('refuses a context scoped to another tenant', () => {
    const errors = findSafetyErrors(context({ tenantId: 'other' }), workflow, {})
    expect(errors[0]).toContain('does not match')
  })

  it('permits the mismatch when cross-tenant access is enabled', () => {
    expect(
      findSafetyErrors(context({ tenantId: 'other' }), workflow, {
        allowCrossTenantAccess: true,
      })
    ).toEqual([])
  })

  it('refuses a level outside the workflow scale', () => {
    const errors = findSafetyErrors(
      context({ user: { id: 'u1', email: '', level: 9 } }),
      workflow,
      {}
    )
    expect(errors[0]).toContain('Invalid user level')
  })

  it.each(['', '   '])('refuses a blank execution id (%p)', executionId => {
    expect(findSafetyErrors(context({ executionId }), workflow, {})).toEqual([
      'Execution ID is required',
    ])
  })

  // A run cannot ask for longer than the workflow itself permits.
  it('refuses limits looser than the workflow allows', () => {
    const errors = findSafetyErrors(
      context({ executionLimits: { maxExecutionTime: 7200000 } }),
      { tenantId: 'acme', executionLimits: { maxExecutionTime: 1000 } },
      {}
    )
    expect(errors[0]).toContain('exceeds workflow limit')
  })

  it('accepts limits equal to the workflow limit', () => {
    expect(
      findSafetyErrors(
        context({ executionLimits: { maxExecutionTime: 1000 } }),
        { tenantId: 'acme', executionLimits: { maxExecutionTime: 1000 } },
        {}
      )
    ).toEqual([])
  })

  // Reported together rather than one per attempt.
  it('collects every problem at once', () => {
    const errors = findSafetyErrors(
      context({
        tenantId: 'other',
        executionId: '',
        user: { id: 'u1', email: '', level: 0 },
      }),
      workflow,
      {}
    )
    expect(errors).toHaveLength(3)
  })
})

describe('assertContextSafe', () => {
  it('returns quietly for a sound context', () => {
    expect(() => {
      assertContextSafe(context(), workflow, {})
    }).not.toThrow()
  })

  it('throws listing every problem', () => {
    expect(() => {
      assertContextSafe(context({ tenantId: 'other', executionId: '' }), workflow, {})
    }).toThrow(/Context validation failed[\s\S]*does not match[\s\S]*required/)
  })
})
