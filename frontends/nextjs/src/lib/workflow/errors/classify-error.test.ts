import { describe, expect, it } from 'vitest'

import { classifyError, errorMessage } from './classify-error'
import { WorkflowErrorCode } from './error-codes'

describe('classifyError', () => {
  it.each([
    ['Validation failed', WorkflowErrorCode.VALIDATION_ERROR],
    ['Execution timeout after 30s', WorkflowErrorCode.EXECUTION_TIMEOUT],
    ['Workflow not found', WorkflowErrorCode.NOT_FOUND],
    ['Forbidden', WorkflowErrorCode.FORBIDDEN],
    ['Unauthorized', WorkflowErrorCode.UNAUTHORIZED],
    ['Circular dependency detected', WorkflowErrorCode.CIRCULAR_DEPENDENCY],
    ['Duplicate node name', WorkflowErrorCode.DUPLICATE_NODE_NAME],
    ['Tenant mismatch', WorkflowErrorCode.TENANT_MISMATCH],
    ['Memory exhausted', WorkflowErrorCode.MEMORY_LIMIT_EXCEEDED],
  ])('reads %s as %s', (message, expected) => {
    expect(classifyError(new Error(message))).toBe(expected)
  })

  // 'not found' used to be tested before 'node not found', which made
  // NODE_NOT_FOUND unreachable: every missing node came back as a plain
  // NOT_FOUND.
  it('distinguishes a missing node from a missing workflow', () => {
    expect(classifyError(new Error('Node not found: n7'))).toBe(
      WorkflowErrorCode.NODE_NOT_FOUND
    )
    expect(classifyError(new Error('Workflow not found'))).toBe(
      WorkflowErrorCode.NOT_FOUND
    )
  })

  it('matches regardless of case', () => {
    expect(classifyError(new Error('TIMEOUT'))).toBe(
      WorkflowErrorCode.EXECUTION_TIMEOUT
    )
  })

  it('is unknown for a message it does not recognise', () => {
    expect(classifyError(new Error('the disk caught fire'))).toBe(
      WorkflowErrorCode.UNKNOWN_ERROR
    )
  })

  it.each([null, undefined, 'a string', 42, {}])(
    'is unknown for the non-Error %p',
    value => {
      expect(classifyError(value)).toBe(WorkflowErrorCode.UNKNOWN_ERROR)
    }
  )
})

describe('errorMessage', () => {
  it('reads the message off an Error', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom')
  })

  it('passes a string through', () => {
    expect(errorMessage('boom')).toBe('boom')
  })

  it.each([null, undefined, 42, {}, []])(
    'describes %p generically',
    value => {
      expect(errorMessage(value)).toBe('An unknown error occurred')
    }
  )
})
