import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { createPackageValidator } from './create-package-validator'

const Person = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

describe('createPackageValidator', () => {
  it('passes valid data through unchanged', () => {
    const validator = createPackageValidator('blog')
    expect(validator(Person, { name: 'a', age: 1 })).toEqual({
      success: true,
      data: { name: 'a', age: 1 },
    })
  })

  // Which package rejected the data is the first thing an operator needs.
  it('prefixes each issue path with the package', () => {
    const validator = createPackageValidator('blog')
    const result = validator(Person, { name: '', age: 1 })
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBe('blog.name')
    }
  })

  it('prefixes a root-level failure too', () => {
    const validator = createPackageValidator('blog')
    const result = validator(z.string(), 7)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toBe('blog.')
    }
  })
})
