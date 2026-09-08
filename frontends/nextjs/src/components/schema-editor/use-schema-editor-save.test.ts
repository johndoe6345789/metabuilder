import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useSchemaEditor } from './useSchemaEditor'

const model = { name: 'Post', fields: [] } as never

const stub = (saveStatus: number) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init?: RequestInit) => {
      if ((init?.method ?? 'GET') === 'GET') {
        return new Response(JSON.stringify({ data: { data: [] } }), {
          status: 200,
        })
      }
      return new Response('{}', { status: saveStatus })
    })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})
afterEach(() => vi.unstubAllGlobals())

/**
 * The PUT's response was never read, so a 4xx was indistinguishable from
 * a save: the editor showed the new model, the founder moved on, and it
 * existed only in this browser's localStorage. The badge that says
 * "changes saved locally only" was already on screen for the load path --
 * it simply was never told about the save path.
 */
describe('saving a schema the data layer refuses', () => {
  it('says the change is local only', async () => {
    stub(422)
    const { result } = renderHook(() => useSchemaEditor('acme'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.saveModels([model])
    })

    expect(result.current.offline).toBe(true)
  })

  it('says nothing of the sort when the save landed', async () => {
    stub(200)
    const { result } = renderHook(() => useSchemaEditor('acme'))
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    await act(async () => {
      await result.current.saveModels([model])
    })

    expect(result.current.offline).toBe(false)
  })
})
