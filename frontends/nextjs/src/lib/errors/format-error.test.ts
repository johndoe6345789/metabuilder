import { describe, it, expect } from 'vitest'
import { formatError } from './format-error'
import { DBALError, DBALErrorCode } from '@/dbal/development/src/core/foundation/errors'

describe('formatError', () => {
  it.each([
    {
      error: new DBALError(DBALErrorCode.NOT_FOUND, 'Resource not found'),
      expected: {
        message: 'Resource not found',
        code: 404,
        details: undefined,
      },
      description: 'DBALError without details',
    },
    {
      error: new DBALError(DBALErrorCode.VALIDATION_ERROR, 'Invalid input', {
        fields: [{ field: 'email', error: 'Invalid format' }],
      }),
      expected: {
        message: 'Invalid input',
        code: 422,
        details: { fields: [{ field: 'email', error: 'Invalid format' }] },
      },
      description: 'DBALError with details',
    },
    {
      error: new Error('Standard error'),
      expected: {
        message: 'Standard error',
        stack: expect.any(String),
      },
      description: 'Standard Error',
    },
    {
      error: 'String error',
      expected: {
        message: 'String error',
      },
      description: 'String error',
    },
    {
      error: { message: 'Custom error' },
      expected: {
        message: 'Custom error',
      },
      description: 'Error-like object',
    },
    {
      error: null,
      expected: {
        message: 'An unknown error occurred',
      },
      description: 'null',
    },
    {
      error: undefined,
      expected: {
        message: 'An unknown error occurred',
      },
      description: 'undefined',
    },
  ])('should format $description correctly', ({ error, expected }) => {
    const result = formatError(error)
    expect(result).toMatchObject(expected)
  })
})
