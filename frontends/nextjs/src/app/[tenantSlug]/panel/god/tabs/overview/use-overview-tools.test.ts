import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'

const dbExport = vi.hoisted(() => ({
  buildDatabaseExport: vi.fn(),
  exportFileName: vi.fn(() => 'metabuilder-export-2026.json'),
}))
const dlJson = vi.hoisted(() => ({ downloadJson: vi.fn() }))
const importSummary = vi.hoisted(() => ({ summariseImport: vi.fn() }))
const previewTargets = vi.hoisted(() => ({
  previewTarget: vi.fn(),
  toolLevel: vi.fn(),
}))

vi.mock('./database-export', () => dbExport)
vi.mock('./download-json', () => dlJson)
vi.mock('./import-summary', () => importSummary)
vi.mock('./preview-targets', () => previewTargets)

import { useOverviewTools } from './use-overview-tools'

const tool = (action: string, params?: Record<string, unknown>) => ({
  action,
  params,
})

beforeEach(() => {
  vi.clearAllMocks()
  dbExport.buildDatabaseExport.mockResolvedValue({ data: {} })
  importSummary.summariseImport.mockReturnValue({
    severity: 'info',
    message: 'ok',
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useOverviewTools', () => {
  it('starts with no flash', () => {
    const { result } = renderHook(() => useOverviewTools(null))
    expect(result.current.flash).toBeNull()
  })

  it('exportDatabase downloads the export and flashes success', async () => {
    const { result } = renderHook(() => useOverviewTools('1.0.0'))

    await act(async () => {
      result.current.runTool(tool('exportDatabase'))
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(dlJson.downloadJson).toHaveBeenCalledWith(
        'metabuilder-export-2026.json',
        { data: {} }
      )
    })
    expect(result.current.flash?.severity).toBe('success')
  })

  it('flashes a warning when the export fails', async () => {
    dbExport.buildDatabaseExport.mockRejectedValue(new Error('down'))
    const { result } = renderHook(() => useOverviewTools('1.0.0'))

    await act(async () => {
      result.current.runTool(tool('exportDatabase'))
      await Promise.resolve()
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(result.current.flash?.severity).toBe('warning')
    })
  })

  it('importDatabase clicks the hidden file input', () => {
    const { result } = renderHook(() => useOverviewTools(null))
    const input = document.createElement('input')
    const click = vi.spyOn(input, 'click')
    Object.defineProperty(result.current.importRef, 'current', {
      value: input,
      writable: true,
    })

    act(() => {
      result.current.runTool(tool('importDatabase'))
    })

    expect(click).toHaveBeenCalledOnce()
  })

  it('previewLevel navigates when a target exists', () => {
    previewTargets.toolLevel.mockReturnValue(2)
    previewTargets.previewTarget.mockReturnValue('http://x/app/profile')
    const assign = vi.fn()
    vi.stubGlobal('location', { origin: 'http://x', assign })

    const { result } = renderHook(() => useOverviewTools(null))
    act(() => {
      result.current.runTool(tool('previewLevel', { level: 2 }))
    })

    expect(assign).toHaveBeenCalledWith('http://x/app/profile')
  })

  it('previewLevel with no target falls through to the unconfigured flash', () => {
    previewTargets.toolLevel.mockReturnValue(9)
    previewTargets.previewTarget.mockReturnValue(null)

    const { result } = renderHook(() => useOverviewTools(null))
    act(() => {
      result.current.runTool(tool('previewLevel', { level: 9 }))
    })

    expect(result.current.flash?.message).toBe('Tool action is not configured.')
  })

  it('an unrecognised action flashes "not configured"', () => {
    const { result } = renderHook(() => useOverviewTools(null))
    act(() => {
      result.current.runTool(tool('doSomethingElse'))
    })
    expect(result.current.flash).toEqual({
      severity: 'info',
      message: 'Tool action is not configured.',
    })
  })

  it('clears any previous flash when a new tool runs', () => {
    const { result } = renderHook(() => useOverviewTools(null))
    act(() => {
      result.current.runTool(tool('doSomethingElse'))
    })
    expect(result.current.flash).not.toBeNull()

    act(() => {
      result.current.setFlash(null)
    })
    expect(result.current.flash).toBeNull()
  })

  it('readImportFile summarises the uploaded file', async () => {
    importSummary.summariseImport.mockReturnValue({
      severity: 'warning',
      message: 'bad file',
    })
    const { result } = renderHook(() => useOverviewTools(null))
    const file = new File(['{"data":{}}'], 'x.json', {
      type: 'application/json',
    })

    await act(async () => {
      await result.current.readImportFile(file)
    })

    expect(result.current.flash?.message).toBe('bad file')
  })
})
