import { beforeEach, describe, expect, it, vi } from 'vitest'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const registryModule = vi.hoisted(() => ({
  loadSchemaRegistry: vi.fn(() => ({ packages: {}, migrationQueue: [] })),
  generateSchemaFragment: vi.fn(() => ''),
}))
const fsMock = vi.hoisted(() => ({ writeFileSync: vi.fn() }))

vi.mock('@/lib/routing', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, getSessionUser: session.getSessionUser }
})
vi.mock('@/lib/schema/schema-registry', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...registryModule }
})
vi.mock('fs', () => ({ ...fsMock, default: fsMock }))

import { POST } from './route'

const req = (body: unknown) =>
  new Request('http://localhost/api/dbal/schema', {
    method: 'POST',
    body: JSON.stringify(body),
  })

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { id: 'u1', role: 'god' } })
})

describe('POST generate', () => {
  it('writes nothing when there is nothing to generate', async () => {
    registryModule.generateSchemaFragment.mockReturnValue('   ')

    const body = await (await POST(req({ action: 'generate' }))).json()

    expect(body.generated).toBe(false)
    expect(fsMock.writeFileSync).not.toHaveBeenCalled()
  })

  it('writes the fragment when there is one', async () => {
    registryModule.generateSchemaFragment.mockReturnValue('model X {}')

    const body = await (await POST(req({ action: 'generate' }))).json()

    expect(body.generated).toBe(true)
    expect(fsMock.writeFileSync).toHaveBeenCalled()
  })
})
