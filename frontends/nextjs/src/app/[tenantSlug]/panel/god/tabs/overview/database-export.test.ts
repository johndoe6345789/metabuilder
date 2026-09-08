import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildDatabaseExport,
  EXPORTED_COLLECTIONS,
  exportFileName,
} from './database-export'

const stub = (failing: string[] = []): string[] => {
  const asked: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const href = String(url)
      asked.push(href)
      const failed = failing.some(f => href.includes(f))
      return {
        ok: !failed,
        status: failed ? 503 : 200,
        json: async () => ({ data: { data: [] } }),
      } as Response
    })
  )
  return asked
}

beforeEach(() => vi.clearAllMocks())
afterEach(() => vi.unstubAllGlobals())

describe('buildDatabaseExport', () => {
  it('reads every declared resource', async () => {
    const asked = stub()
    await buildDatabaseExport('acme', null)
    expect(asked).toHaveLength(EXPORTED_COLLECTIONS.length)
    for (const [, path] of EXPORTED_COLLECTIONS) {
      expect(asked.some(url => url.includes(path))).toBe(true)
    }
  })

  /**
   * These paths were fixed at /system/, so a founder pressed "Export
   * Database", was told it had downloaded, and got a file of the shared
   * tenant's users, workflows and pages -- somebody else's data, offered
   * as their own backup.
   */
  it('reads the community it was asked about, not "system"', async () => {
    const asked = stub()
    await buildDatabaseExport('harbour_cycle_works', null)

    for (const url of asked) {
      expect(url).toContain('/harbour_cycle_works/')
      expect(url).not.toContain('/system/')
    }
  })

  it('records whose data the file holds', async () => {
    stub()
    const result = await buildDatabaseExport('harbour_cycle_works', null)
    expect(result.tenant).toBe('harbour_cycle_works')
  })

  it('keys the payload by collection name', async () => {
    stub()
    const result = await buildDatabaseExport('acme', null)
    expect(Object.keys(result.data)).toEqual(
      EXPORTED_COLLECTIONS.map(([key]) => key)
    )
  })

  it('stamps the version and the moment it was taken', async () => {
    stub()
    const result = await buildDatabaseExport('acme', '2.1', '2026-01-01T00:00:00.000Z')
    expect(result.dbalVersion).toBe('2.1')
    expect(result.exportedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  // A partial snapshot with its gaps named is more use than none at all.
  it('records an unreadable collection as an error inside the file', async () => {
    stub(['/Workflow'])
    const result = await buildDatabaseExport('acme', null)
    expect(result.data.workflows).toEqual({ error: 'HTTP 503' })
    expect(result.data.users).not.toHaveProperty('error')
  })

  it('reports a null version when none is known', async () => {
    stub()
    expect((await buildDatabaseExport('acme', null)).dbalVersion).toBeNull()
  })
})

describe('exportFileName', () => {
  // The community is in the name as well as the moment: a founder with
  // two of these open should not have to guess which is theirs.
  it('carries the community and the moment it was taken', () => {
    expect(exportFileName('acme', '2026-01-01T00:00:00.000Z')).toBe(
      'metabuilder-acme-2026-01-01T00:00:00.000Z.json'
    )
  })

  it('ends in .json', () => {
    expect(exportFileName('acme')).toMatch(/\.json$/)
  })
})
