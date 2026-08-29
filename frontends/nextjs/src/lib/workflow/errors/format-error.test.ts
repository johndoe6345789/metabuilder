import { describe, expect, it } from 'vitest'

import { WorkflowErrorCode } from './error-codes'
import { ERROR_HINTS } from './error-hints'
import { ERROR_MESSAGES } from './error-messages'
import { ERROR_STATUS_MAP } from './error-status'
import { formatError } from './format-error'

const CODE = WorkflowErrorCode.VALIDATION_ERROR

describe('formatError', () => {
  it('takes its status and message from the catalogue', () => {
    const response = formatError({ code: CODE })
    expect(response.status).toBe(ERROR_STATUS_MAP[CODE])
    expect(response.json.error.message).toBe(ERROR_MESSAGES[CODE])
  })

  it('attaches the catalogue hint for the code', () => {
    expect(formatError({ code: CODE }).json.diagnostics?.hint).toBe(
      ERROR_HINTS[CODE]
    )
  })

  it('always marks the response as a failure', () => {
    expect(formatError({ code: CODE }).json.success).toBe(false)
  })

  it('lets a caller override the message and the status', () => {
    const response = formatError({
      code: CODE,
      message: 'something specific',
      status: 418,
    })
    expect(response.status).toBe(418)
    expect(response.json.error.message).toBe('something specific')
    expect(response.json.error.statusCode).toBe(418)
  })

  it('merges caller diagnostics over the hint', () => {
    const diagnostics = formatError({
      code: CODE,
      diagnostics: { suggestions: ['try again'] },
    }).json.diagnostics
    expect(diagnostics?.hint).toBe(ERROR_HINTS[CODE])
    expect(diagnostics?.suggestions).toEqual(['try again'])
  })

  // Only the four linking fields cross into the response body: an error
  // context also carries a userId, a cause and a stack.
  it('copies only the linking fields out of the context', () => {
    const response = formatError({
      code: CODE,
      context: {
        executionId: 'e1',
        workflowId: 'w1',
        nodeId: 'n1',
        tenantId: 't1',
        userId: 'u1',
        cause: new Error('internal detail'),
      },
    })
    expect(response.json.context).toEqual({
      executionId: 'e1',
      workflowId: 'w1',
      nodeId: 'n1',
      tenantId: 't1',
    })
    expect(JSON.stringify(response.json.context)).not.toContain('u1')
  })

  it('omits the context entirely when none was given', () => {
    expect(formatError({ code: CODE }).json.context).toBeUndefined()
  })

  it('carries headers through only when there are some', () => {
    expect(formatError({ code: CODE }).headers).toBeUndefined()
    const headers = new Map([['Retry-After', '60']])
    expect(formatError({ code: CODE, headers }).headers).toBe(headers)
  })
})
