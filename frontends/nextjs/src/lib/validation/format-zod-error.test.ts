import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { formatZodError } from './format-zod-error'

const Person = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

describe('formatZodError', () => {
  it('carries the code alongside the message', () => {
    const parsed = Person.safeParse({ name: 1, age: 1 })
    if (parsed.success) throw new Error('expected a failure')
    const formatted = formatZodError(parsed.error)
    expect(formatted.issues[0]).toMatchObject({
      path: 'name',
      code: expect.any(String),
      message: expect.any(String),
    })
  })
})
