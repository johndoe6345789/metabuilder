import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'

const store = vi.hoisted(() => ({
  god: { plan: [], tree: null } as Record<string, unknown>,
  rehydrated: null as unknown,
}))
const persist = vi.hoisted(() => ({
  idbDump: vi.fn(async () => ({ 'versions:1': { at: 1 } })),
  idbRestore: vi.fn(async () => undefined),
}))

vi.mock('@/lib/persist/idb-kv', () => persist)
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => (action: { type: string; payload?: unknown }) => {
    if (action.type === 'rehydrate') store.rehydrated = action.payload
  },
  useAppSelector: (fn: (s: unknown) => unknown) => fn({ god: store.god }),
}))
vi.mock('@/store/slices/god-slice', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    rehydrate: (payload: unknown) => ({ type: 'rehydrate', payload }),
  }
})

import { useDeploy } from './use-deploy'

/**
 * Captures the download the export triggers, without a real one.
 *
 * Only the anchor is intercepted -- testing-library creates its own
 * container element through the same call, so replacing every
 * createElement breaks rendering.
 */
const captureDownload = () => {
  const anchor = { href: '', download: '', click: vi.fn() }
  const created: Blob[] = []
  const real = document.createElement.bind(document)
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) =>
    tag === 'a' ? (anchor as unknown as HTMLAnchorElement) : real(tag)
  )
  vi.stubGlobal('URL', {
    createObjectURL: (blob: Blob) => {
      created.push(blob)
      return 'blob:project'
    },
    revokeObjectURL: vi.fn(),
  })
  return { anchor, created }
}

const projectFile = (content: string): File =>
  ({ text: async () => content }) as File

beforeEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
  store.rehydrated = null
  persist.idbDump.mockResolvedValue({ 'versions:1': { at: 1 } })
})

describe('useDeploy', () => {
  it('starts idle with nothing to report', () => {
    const { result } = renderHook(() => useDeploy())
    expect(result.current.busy).toBe(false)
    expect(result.current.flash).toBeNull()
  })

  it('exports the redux state and the local store together', async () => {
    const { created } = captureDownload()
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.exportProject()
    })
    const text = await created[0]?.text()
    expect(JSON.parse(text ?? '{}')).toMatchObject({
      kind: 'metabuilder-project',
      version: 2,
      god: store.god,
      idb: { 'versions:1': { at: 1 } },
    })
  })

  it('names the file with today\'s date', async () => {
    const { anchor } = captureDownload()
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.exportProject()
    })
    expect(anchor.download).toMatch(
      /^metabuilder-project-\d{4}-\d{2}-\d{2}\.json$/
    )
    expect(anchor.click).toHaveBeenCalledOnce()
  })

  it('reports the export when it finishes', async () => {
    captureDownload()
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.exportProject()
    })
    expect(result.current.flash).toBe('Project exported.')
    expect(result.current.busy).toBe(false)
  })

  it('imports both halves of a project file', async () => {
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.importProject(
        projectFile(
          JSON.stringify({ god: { plan: ['x'] }, idb: { k: 'v' } })
        )
      )
    })
    expect(store.rehydrated).toEqual({ plan: ['x'] })
    expect(persist.idbRestore).toHaveBeenCalledWith({ k: 'v' })
    expect(result.current.flash).toBe('Project imported.')
  })

  it('imports a file carrying only the redux half', async () => {
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.importProject(
        projectFile(JSON.stringify({ god: { plan: [] } }))
      )
    })
    expect(persist.idbRestore).not.toHaveBeenCalled()
    expect(result.current.flash).toBe('Project imported.')
  })

  // A file that is not a project must say so rather than half-loading.
  it('reports a failure for a file that is not JSON', async () => {
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.importProject(projectFile('not a project'))
    })
    expect(result.current.flash).toBe(
      'Import failed — not a valid project file.'
    )
    expect(store.rehydrated).toBeNull()
  })

  it('is no longer busy after a failed import', async () => {
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.importProject(projectFile('{'))
    })
    expect(result.current.busy).toBe(false)
  })

  it('clears the message when asked', async () => {
    captureDownload()
    const { result } = renderHook(() => useDeploy())
    await act(async () => {
      await result.current.exportProject()
    })
    act(() => {
      result.current.clearFlash()
    })
    expect(result.current.flash).toBeNull()
  })
})
