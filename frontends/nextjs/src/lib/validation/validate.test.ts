import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validate } from './validate'

const Person = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

describe('validate', () => {
  it('returns the parsed data on success', () => {
    const result = validate(Person, { name: 'alice', age: 30 })
    expect(result).toEqual({ success: true, data: { name: 'alice', age: 30 } })
  })

  it('reports the path of the offending field', () => {
    const result = validate(Person, { name: '', age: 30 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBe('name')
    }
  })

  it('reports every problem, not just the first', () => {
    const result = validate(Person, { name: '', age: -1 })
    if (!result.success) {
      expect(result.error.issues).toHaveLength(2)
    }
  })

  it('reports a nested path with dots', () => {
    const Nested = z.object({ user: z.object({ name: z.string() }) })
    const result = validate(Nested, { user: { name: 7 } })
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBe('user.name')
    }
  })

  it('gives an empty path for a failure at the root', () => {
    const result = validate(z.string(), 7)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBe('')
    }
  })
})
