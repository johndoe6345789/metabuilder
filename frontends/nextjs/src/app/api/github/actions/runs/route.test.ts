import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Routing from '@/lib/routing'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const client = vi.hoisted(() => ({ createGitHubClient: vi.fn(() => ({})) }))
const runs = vi.hoisted(() => ({ listWorkflowRuns: vi.fn() }))

vi.mock('@/lib/routing', async importOriginal => ({
  ...(await importOriginal<typeof Routing>()),
  getSessionUser: session.getSessionUser,
}))
vi.mock('@/lib/github/create-github-client', () => client)
vi.mock('@/lib/github/workflows/listing/list-workflow-runs', () => runs)

import { GET } from './route'

type Req = Parameters<typeof GET>[0]

const req = (query = ''): Req =>
  ({
    nextUrl: new URL(`http://localhost/api/github/actions/runs${query}`),
  }) as unknown as Req

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { role: 'admin' } })
  runs.listWorkflowRuns.mockResolvedValue([{ id: 1 }])
})

describe('GET /api/github/actions/runs', () => {
  it('is 401 with no session', async () => {
    session.getSessionUser.mockResolvedValue({ user: null })
    const res = await GET(req())
    expect(res.status).toBe(401)
    const body = (await res.json()) as { requiresAuth: boolean }
    expect(body.requiresAuth).toBe(true)
  })

  it('is 403 below user level', async () => {
    session.getSessionUser.mockResolvedValue({ user: { role: 'public' } })
    const res = await GET(req())
    expect(res.status).toBe(403)
  })

  it('lists runs for the resolved owner/repo', async () => {
    const res = await GET(req('?owner=acme&repo=widgets'))
    expect(res.status).toBe(200)
    expect(runs.listWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'acme', repo: 'widgets', perPage: 20 })
    )
    const body = (await res.json()) as { runs: unknown[] }
    expect(body.runs).toEqual([{ id: 1 }])
  })

  it('clamps perPage into 1..100', async () => {
    await GET(req('?perPage=500'))
    expect(runs.listWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ perPage: 100 })
    )
  })

  it('clamps a perPage below 1 up to 1', async () => {
    await GET(req('?perPage=0'))
    expect(runs.listWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ perPage: 1 })
    )
  })

  it('ignores a non-numeric perPage and falls back to 20', async () => {
    await GET(req('?perPage=abc'))
    expect(runs.listWorkflowRuns).toHaveBeenCalledWith(
      expect.objectContaining({ perPage: 20 })
    )
  })

  it('reports the GitHub client error status when listing fails', async () => {
    runs.listWorkflowRuns.mockRejectedValue(
      Object.assign(new Error('rate limited'), { status: 403 })
    )
    const res = await GET(req())
    expect(res.status).toBe(403)
    const body = (await res.json()) as { requiresAuth: boolean }
    expect(body.requiresAuth).toBe(true)
  })

  it('falls back to 500 for an error with no usable status', async () => {
    runs.listWorkflowRuns.mockRejectedValue(new Error('boom'))
    const res = await GET(req())
    expect(res.status).toBe(500)
  })
})
