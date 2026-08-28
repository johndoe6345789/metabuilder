import { describe, expect, it } from 'vitest'

import {
  SchemaRegistry,
  approveMigration,
  getPendingMigrations,
  rejectMigration,
} from '@/lib/schema/schema-registry'
import { queued } from './test-support/registry-fixtures'

describe('migration queue', () => {
  it('lists only pending entries, normalising their entities', () => {
    const registry = new SchemaRegistry()
    registry.migrationQueue = [
      queued(),
      queued({ id: 'm2', status: 'approved' }),
      { nonsense: true },
    ]

    const pending = getPendingMigrations(registry)

    expect(pending).toHaveLength(1)
    // Strings and {name} both become {name}; anything else is dropped.
    expect(pending[0]?.entities).toEqual([
      { name: 'User' },
      { name: 'Invoice' },
    ])
  })

  it('treats a non-array entities field as none', () => {
    const registry = new SchemaRegistry()
    registry.migrationQueue = [queued({ entities: 'User' })]
    expect(getPendingMigrations(registry)[0]?.entities).toEqual([])
  })

  it('approves a pending migration and stamps the time', () => {
    const registry = new SchemaRegistry()
    const entry = queued()
    registry.migrationQueue = [entry]

    expect(approveMigration('m1', registry)).toBe(true)
    expect(entry.status).toBe('approved')
    expect(typeof (entry as { approvedAt?: string }).approvedAt).toBe('string')
  })

  it('rejects a pending migration', () => {
    const registry = new SchemaRegistry()
    const entry = queued()
    registry.migrationQueue = [entry]

    expect(rejectMigration('m1', registry)).toBe(true)
    expect(entry.status).toBe('rejected')
  })

  it('will not decide one that is missing or already decided', () => {
    const registry = new SchemaRegistry()
    registry.migrationQueue = [queued({ status: 'approved' })]

    expect(approveMigration('m1', registry)).toBe(false)
    expect(approveMigration('nope', registry)).toBe(false)
    expect(rejectMigration('nope', registry)).toBe(false)
  })
})
