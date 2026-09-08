import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const scope = vi.hoisted(() => ({
  useCurrentTenantScope: vi.fn(() => ({
    tenant: 'kestrelbindery',
    canPickOtherTenant: false,
  })),
}))
const data = vi.hoisted(() => ({
  fetchSubmissions: vi.fn(),
  setSubmissionStatus: vi.fn(),
}))
vi.mock('../use-current-tenant-scope', () => scope)
vi.mock('./submissions-data', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, ...data }
})

import { parseSubmission } from './submission-row'
import { useSubmissions } from './use-submissions'

const sub = (over: Record<string, unknown>) =>
  parseSubmission({ path: '/contact', formName: 'contact', ...over })

const rows = [
  sub({ id: 'fs_1', data: { name: 'Rosa' } }),
  sub({ id: 'fs_2', formName: 'signup', status: 'handled' }),
]

beforeEach(() => {
  vi.clearAllMocks()
  data.fetchSubmissions.mockResolvedValue(rows)
  data.setSubmissionStatus.mockResolvedValue(undefined)
})

const ready = async () => {
  const hook = renderHook(() => useSubmissions())
  await waitFor(() => {
    expect(hook.result.current.loading).toBe(false)
  })
  return hook
}

describe('useSubmissions', () => {
  it("reads the messages of the community whose panel this is", async () => {
    await ready()
    expect(data.fetchSubmissions).toHaveBeenCalledWith('kestrelbindery')
  })

  it('hides handled messages until they are asked for', async () => {
    const { result } = await ready()
    expect(result.current.visible.map(r => r.id)).toEqual(['fs_1'])

    act(() => {
      result.current.setShowHandled(true)
    })
    expect(result.current.visible).toHaveLength(2)
  })

  it('narrows to one form', async () => {
    const { result } = await ready()
    act(() => {
      result.current.setShowHandled(true)
      result.current.setForm('signup')
    })
    expect(result.current.visible.map(r => r.id)).toEqual(['fs_2'])
  })

  it('lists the forms that have been submitted', async () => {
    const { result } = await ready()
    expect(result.current.forms).toEqual(['contact', 'signup'])
  })

  it('counts what is still waiting, whatever is filtered', async () => {
    const { result } = await ready()
    act(() => {
      result.current.setForm('signup')
    })
    expect(result.current.waiting).toBe(1)
  })

  /**
   * The whole reason this screen exists: a data layer that cannot answer
   * looks exactly like an inbox with nothing in it.
   */
  it('reports a failed read instead of showing an empty inbox', async () => {
    data.fetchSubmissions.mockRejectedValue(new Error('HTTP 404'))
    const { result } = await ready()

    expect(result.current.error).toBe('HTTP 404')
    expect(result.current.visible).toEqual([])
  })

  it('drops stale rows when a later read fails', async () => {
    const { result } = await ready()
    expect(result.current.visible).toHaveLength(1)

    data.fetchSubmissions.mockRejectedValue(new Error('HTTP 500'))
    act(() => {
      result.current.refresh()
    })
    await waitFor(() => {
      expect(result.current.error).toBe('HTTP 500')
    })
    expect(result.current.rows).toEqual([])
  })
})

describe('marking a message handled', () => {
  it('marks it at once and writes it', async () => {
    const { result } = await ready()

    await act(() => result.current.mark(rows[0], true))

    expect(data.setSubmissionStatus).toHaveBeenCalledWith(
      'kestrelbindery',
      'fs_1',
      'handled'
    )
    expect(result.current.waiting).toBe(0)
    expect(result.current.markError).toBeNull()
  })

  it('puts it back and says why when the write is refused', async () => {
    data.setSubmissionStatus.mockRejectedValue(new Error('HTTP 403'))
    const { result } = await ready()

    await act(() => result.current.mark(rows[0], true))

    expect(result.current.rows[0].status).toBe('new')
    expect(result.current.markError).toBe(
      'Could not mark that message: HTTP 403'
    )
  })

  it('puts a handled message back to waiting', async () => {
    const { result } = await ready()

    await act(() => result.current.mark(rows[1], false))

    expect(data.setSubmissionStatus).toHaveBeenCalledWith(
      'kestrelbindery',
      'fs_2',
      'new'
    )
  })
})
