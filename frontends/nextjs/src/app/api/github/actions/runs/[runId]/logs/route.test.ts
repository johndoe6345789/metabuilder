import { beforeEach, describe, expect, it, vi } from 'vitest'
import type * as Routing from '@/lib/routing'

const session = vi.hoisted(() => ({ getSessionUser: vi.fn() }))
const client = vi.hoisted(() => ({ createGitHubClient: vi.fn(() => ({})) }))
const logs = vi.hoisted(() => ({ fetchWorkflowRunLogs: vi.fn() }))

vi.mock('@/lib/routing', async importOriginal => ({
  ...(await importOriginal<typeof Routing>()),
  getSessionUser: session.getSessionUser,
}))
vi.mock('@/lib/github/create-github-client', () => client)
vi.mock('@/lib/github/fetch-workflow-run-logs', () => logs)

import { GET } from './route'

type Req = Parameters<typeof GET>[0]
type Ctx = Parameters<typeof GET>[1]

const req = (query = ''): Req =>
  ({
    nextUrl: new URL(`http://localhost/api/x${query}`),
  }) as unknown as Req

const ctx = (runId: string): Ctx =>
  ({ params: Promise.resolve({ runId }) }) as Ctx

beforeEach(() => {
  vi.clearAllMocks()
  session.getSessionUser.mockResolvedValue({ user: { role: 'admin' } })
  logs.fetchWorkflowRunLogs.mockResolvedValue({
    jobs: [{ id: 1 }],
    logsText: 'log output',
    truncated: false,
  })
})

describe('GET /api/github/actions/runs/[runId]/logs', () => {
  it('is 401 with no session', async () => {
    session.getSessionUser.mockResolvedValue({ user: null })
    const res = await GET(req(), ctx('42'))
    expect(res.status).toBe(401)
  })

  it('is 403 below user level', async () => {
    session.getSessionUser.mockResolvedValue({ user: { role: 'public' } })
    const res = await GET(req(), ctx('42'))
    expect(res.status).toBe(403)
  })

  it('is 400 for a non-numeric run id', async () => {
    const res = await GET(req(), ctx('not-a-number'))
    expect(res.status).toBe(400)
  })

  it('is 400 for a non-positive run id', async () => {
    const res = await GET(req(), ctx('0'))
    expect(res.status).toBe(400)
  })

  it('returns the jobs/logsText/truncated on success', async () => {
    const res = await GET(req('?owner=acme&repo=widgets'), ctx('42'))
    expect(res.status).toBe(200)
    const body = (await res.json()) as { jobs: unknown[]; logsText: string }
    expect(body.jobs).toEqual([{ id: 1 }])
    expect(body.logsText).toBe('log output')
    expect(logs.fetchWorkflowRunLogs).toHaveBeenCalledWith(
      expect.objectContaining({ owner: 'acme', repo: 'widgets', runId: 42 })
    )
  })

  it('floors a fractional run id', async () => {
    await GET(req(), ctx('42.9'))
    expect(logs.fetchWorkflowRunLogs).toHaveBeenCalledWith(
      expect.objectContaining({ runId: 42 })
    )
  })

  it('is 500 when fetchWorkflowRunLogs resolves null', async () => {
    logs.fetchWorkflowRunLogs.mockResolvedValue(null)
    const res = await GET(req(), ctx('42'))
    expect(res.status).toBe(500)
  })

  it('reports the underlying error status when the call throws', async () => {
    logs.fetchWorkflowRunLogs.mockRejectedValue(
      Object.assign(new Error('rate limited'), { status: 401 })
    )
    const res = await GET(req(), ctx('42'))
    expect(res.status).toBe(401)
    const body = (await res.json()) as { requiresAuth: boolean }
    expect(body.requiresAuth).toBe(true)
  })

  it('falls back to 500 for an error with no usable status', async () => {
    logs.fetchWorkflowRunLogs.mockRejectedValue(new Error('boom'))
    const res = await GET(req(), ctx('42'))
    expect(res.status).toBe(500)
  })
})
