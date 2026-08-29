import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildDatabaseExport,
  EXPORTED_RESOURCES,
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
    await buildDatabaseExport(null)
    expect(asked).toHaveLength(EXPORTED_RESOURCES.length)
    for (const [, path] of EXPORTED_RESOURCES) {
      expect(asked.some(url => url.includes(path))).toBe(true)
    }
  })

  it('keys the payload by collection name', async () => {
    stub()
    const result = await buildDatabaseExport(null)
    expect(Object.keys(result.data)).toEqual(
      EXPORTED_RESOURCES.map(([key]) => key)
    )
  })

  it('stamps the version and the moment it was taken', async () => {
    stub()
    const result = await buildDatabaseExport('2.1', '2026-01-01T00:00:00.000Z')
    expect(result.dbalVersion).toBe('2.1')
    expect(result.exportedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  // A partial snapshot with its gaps named is more use than none at all.
  it('records an unreadable collection as an error inside the file', async () => {
    stub(['/Workflow'])
    const result = await buildDatabaseExport(null)
    expect(result.data.workflows).toEqual({ error: 'HTTP 503' })
    expect(result.data.users).not.toHaveProperty('error')
  })

  it('reports a null version when none is known', async () => {
    stub()
    expect((await buildDatabaseExport(null)).dbalVersion).toBeNull()
  })
})

describe('exportFileName', () => {
  it('carries the moment it was taken', () => {
    expect(exportFileName('2026-01-01T00:00:00.000Z')).toBe(
      'metabuilder-export-2026-01-01T00:00:00.000Z.json'
    )
  })

  it('ends in .json', () => {
    expect(exportFileName()).toMatch(/\.json$/)
  })
})
