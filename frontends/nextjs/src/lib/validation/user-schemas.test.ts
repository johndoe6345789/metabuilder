import { describe, expect, it } from 'vitest'
import { UserSchemas } from './user-schemas'

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
