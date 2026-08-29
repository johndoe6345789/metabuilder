import { describe, expect, it } from 'vitest'

import { WorkflowErrorCode } from './error-codes'
import { exhaustionCode } from './resource-errors'

describe('exhaustionCode', () => {
  it('reads a memory limit from the reason', () => {
    expect(exhaustionCode('Memory limit of 512MB exceeded')).toBe(
      WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
    )
  })

  // "memory" alone is not a limit -- an allocation failure is a resource
  // problem, not a cap the operator set.
  it('needs both memory and limit to name a memory limit', () => {
    expect(exhaustionCode('out of memory')).toBe(
      WorkflowErrorCode.INSUFFICIENT_RESOURCES
    )
  })

  it('reads a full queue from the reason', () => {
    expect(exhaustionCode('Execution queue is full')).toBe(
      WorkflowErrorCode.EXECUTION_QUEUE_FULL
    )
  })

  it('matches regardless of case', () => {
    expect(exhaustionCode('MEMORY LIMIT REACHED')).toBe(
      WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED
    )
  })

  it.each(['Insufficient resources', '', 'the disk is tired'])(
    'falls back to insufficient resources for %p',
    reason => {
      expect(exhaustionCode(reason)).toBe(
        WorkflowErrorCode.INSUFFICIENT_RESOURCES
      )
    }
  )
})
