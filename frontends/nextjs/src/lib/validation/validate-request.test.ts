import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validateRequest } from './validate-request'

const Person = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

const body = (payload: unknown): Request =>
  new Request('http://localhost/x', {
    method: 'POST',
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
  })

describe('validateRequest', () => {
  it('validates a JSON body', async () => {
    const result = await validateRequest(body({ name: 'a', age: 1 }), Person)
    expect(result.success).toBe(true)
  })

  it('reports the field problems in a well-formed body', async () => {
    const result = await validateRequest(body({ name: '', age: 1 }), Person)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBe('name')
    }
  })

  // A body that is not JSON at all is a different failure from a body
  // whose fields are wrong, and says so.
  it('reports unparseable JSON as its own issue', async () => {
    const result = await validateRequest(body('not json'), Person)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]).toEqual({
        path: '',
        message: 'Invalid JSON body',
        code: 'invalid_json',
      })
    }
  })
})
