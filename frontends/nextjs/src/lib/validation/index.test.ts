import { describe, expect, it } from 'vitest'

import {
  CommonSchemas,
  createPackageValidator,
  formatZodError,
  PackageSchemas,
  UserSchemas,
  validate,
  validateRequest,
  z,
} from './index'

const Person = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
})

const body = (payload: unknown): Request =>
  new Request('http://localhost/x', {
    method: 'POST',
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
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

describe('CommonSchemas', () => {
  it.each(['abc', 'a-b-c', 'a1'])('accepts the slug %p', slug => {
    expect(CommonSchemas.slug.safeParse(slug).success).toBe(true)
  })

  it.each(['Abc', 'a_b', 'a b', 'a.b', ''])(
    'rejects the slug %p',
    slug => {
      expect(CommonSchemas.slug.safeParse(slug).success).toBe(false)
    }
  )

  it('rejects an id longer than 64 characters', () => {
    expect(CommonSchemas.id.safeParse('a'.repeat(65)).success).toBe(false)
    expect(CommonSchemas.id.safeParse('a'.repeat(64)).success).toBe(true)
  })

  it.each([1, 100])('accepts the positive integer %i', value => {
    expect(CommonSchemas.positiveInt.safeParse(value).success).toBe(true)
  })

  it.each([0, -1, 1.5])('rejects %p as a positive integer', value => {
    expect(CommonSchemas.positiveInt.safeParse(value).success).toBe(false)
  })

  it('accepts zero as a non-negative integer', () => {
    expect(CommonSchemas.nonNegativeInt.safeParse(0).success).toBe(true)
  })

  it.each([1700000000000, 1700000000000n, '1700000000000'])(
    'accepts the timestamp %p',
    value => {
      expect(CommonSchemas.timestamp.safeParse(value).success).toBe(true)
    }
  )

  it.each([true, false, 'true', 'false'])(
    'accepts the boolean-like %p',
    value => {
      expect(CommonSchemas.booleanLike.safeParse(value).success).toBe(true)
    }
  )

  it('coerces the strings to real booleans', () => {
    expect(CommonSchemas.booleanLike.parse('true')).toBe(true)
    expect(CommonSchemas.booleanLike.parse('false')).toBe(false)
  })

  it.each(['yes', '1', 'TRUE'])('rejects %p as boolean-like', value => {
    expect(CommonSchemas.booleanLike.safeParse(value).success).toBe(false)
  })

  it('accepts a string that really is JSON', () => {
    expect(CommonSchemas.jsonString.safeParse('{"a":1}').success).toBe(true)
    expect(CommonSchemas.jsonString.safeParse('{ not json').success).toBe(
      false
    )
  })

  it('defaults pagination rather than failing on an empty query', () => {
    expect(CommonSchemas.pagination.parse({})).toEqual({
      page: 1,
      perPage: 20,
    })
  })

  it('coerces pagination from query strings', () => {
    expect(CommonSchemas.pagination.parse({ page: '3', perPage: '50' })).toEqual(
      { page: 3, perPage: 50 }
    )
  })

  // An unbounded page size is a way to ask for the whole table at once.
  it('caps the page size', () => {
    expect(CommonSchemas.pagination.safeParse({ perPage: 101 }).success).toBe(
      false
    )
  })
})

describe('PackageSchemas', () => {
  it.each(['blog', 'blog_posts', 'a1'])('accepts the id %p', id => {
    expect(PackageSchemas.packageId.safeParse(id).success).toBe(true)
  })

  // The same shape the route guard enforces before touching the disk.
  it.each(['Blog', '1blog', '_blog', 'blog-posts', '../etc', ''])(
    'rejects the id %p',
    id => {
      expect(PackageSchemas.packageId.safeParse(id).success).toBe(false)
    }
  )

  it.each(['1.0.0', '10.2.3', '1.0.0-beta.1'])(
    'accepts the version %p',
    version => {
      expect(PackageSchemas.version.safeParse(version).success).toBe(true)
    }
  )

  it.each(['1.0', 'v1.0.0', '', 'latest'])(
    'rejects the version %p',
    version => {
      expect(PackageSchemas.version.safeParse(version).success).toBe(false)
    }
  )

  it('defaults an install to enabled', () => {
    expect(
      PackageSchemas.installConfig.parse({ packageId: 'blog' })
    ).toMatchObject({ enabled: true })
  })
})

describe('UserSchemas', () => {
  it.each(['public', 'user', 'moderator', 'admin', 'god', 'supergod'])(
    'accepts the role %p',
    role => {
      expect(UserSchemas.role.safeParse(role).success).toBe(true)
    }
  )

  it.each(['owner', 'root', 'GOD', ''])('rejects the role %p', role => {
    expect(UserSchemas.role.safeParse(role).success).toBe(false)
  })

  // A signup must not be able to name its own privileged role.
  it.each(['god', 'supergod', 'public'])(
    'refuses %p on a create payload',
    role => {
      expect(
        UserSchemas.createUser.safeParse({
          username: 'alice',
          email: 'a@b.co',
          password: 'longenough',
          role,
        }).success
      ).toBe(false)
    }
  )

  it('defaults a new account to the user role', () => {
    expect(
      UserSchemas.createUser.parse({
        username: 'alice',
        email: 'a@b.co',
        password: 'longenough',
      })
    ).toMatchObject({ role: 'user' })
  })

  it.each(['alice', 'a_b-c', 'A1b'])('accepts the username %p', username => {
    expect(UserSchemas.username.safeParse(username).success).toBe(true)
  })

  it.each(['ab', '1alice', '_alice', 'a'.repeat(33), 'a b'])(
    'rejects the username %p',
    username => {
      expect(UserSchemas.username.safeParse(username).success).toBe(false)
    }
  )

  it('requires a password of at least eight characters', () => {
    expect(UserSchemas.password.safeParse('1234567').success).toBe(false)
    expect(UserSchemas.password.safeParse('12345678').success).toBe(true)
  })

  it('rejects a level outside the ladder', () => {
    expect(UserSchemas.level.safeParse(6).success).toBe(false)
    expect(UserSchemas.level.safeParse(-1).success).toBe(false)
    expect(UserSchemas.level.safeParse(5).success).toBe(true)
  })
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
