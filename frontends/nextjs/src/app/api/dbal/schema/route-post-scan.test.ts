import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(() => ({ packages: {}, migrationQueue: [] })),
  saveSchemaRegistry: vi.fn(),
}))
const scanner = vi.hoisted(() => ({
  scanAllPackages: vi.fn(() => ({ scanned: 2, queued: 1, errors: [] })),
}))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/schema/schema-registry', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...registryModule }
})
vi.mock('@/lib/schema/schema-scanner', () => scanner)

import { POST } from './route'

const req = (body: unknown) =>
  new Request('http://localhost/api/dbal/schema', {
    method: 'POST',
    body: JSON.stringify(body),
  })

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { id: 'u1', role: 'god' } })
  scanner.scanAllPackages.mockReturnValue({ scanned: 2, queued: 1, errors: [] })
})

describe('POST scan', () => {
  it('reports what the scan found and saves the registry', async () => {
    const body = await (await POST(req({ action: 'scan' }))).json()

    expect(body).toMatchObject({
      action: 'scan',
      packagesScanned: 2,
      changesQueued: 1,
    })
    expect(registryModule.saveSchemaRegistry).toHaveBeenCalled()
  })

  it('passes scan errors through rather than hiding them', async () => {
    scanner.scanAllPackages.mockReturnValue({
      scanned: 1,
      queued: 0,
      errors: ['bad package.json'],
    })

    const body = await (await POST(req({ action: 'scan' }))).json()

    expect(body.errors).toEqual(['bad package.json'])
  })
})
