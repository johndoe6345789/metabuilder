import { beforeEach, describe, expect, it } from 'vitest'
import { DBALClient, resetDBALStubState } from '@/lib/dbal-stub'

describe('dbal-stub users', () => {
  beforeEach(() => {
    resetDBALStubState()
  })

  it('lists seeded users', async () => {
    const client = new DBALClient({ adapter: 'stub' })
    const result = await client.users.list()

    expect(result.data.length).toBeGreaterThanOrEqual(2)
    const emails = result.data.map((user) => user.email)
    expect(emails).toContain('admin@example.com')
    expect(emails).toContain('user@example.com')
  })

  it('creates, updates, and deletes a user', async () => {
    const client = new DBALClient({ adapter: 'stub' })

    const created = await client.users.create({
      username: 'newuser',
      email: 'newuser@example.com',
      role: 'admin',
      bio: 'hello',
    })

    expect(created.id).toBeDefined()
    expect(created.bio).toBe('hello')

    const fetched = await client.users.get(created.id)
    expect(fetched?.email).toBe('newuser@example.com')

    const updated = await client.users.update(created.id, {
      email: 'updated@example.com',
      profilePicture: 'https://example.com/avatar.png',
    })
    expect(updated.email).toBe('updated@example.com')
    expect(updated.profilePicture).toBe('https://example.com/avatar.png')

    const deleted = await client.users.delete(created.id)
    expect(deleted).toBe(true)

    const afterDelete = await client.users.get(created.id)
    expect(afterDelete).toBeNull()
  })
})
