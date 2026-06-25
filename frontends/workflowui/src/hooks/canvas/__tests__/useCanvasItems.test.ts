/**
 * Tests for useCanvasItems hook
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  selectProjectIsLoading: jest.fn(),
  selectProjectError: jest.fn(),
  selectCurrentProjectId: jest.fn(),
  selectCanvasItems: jest.fn(),
  selectIsResizing: jest.fn(),
  setResizing: jest.fn((v) => ({ type: 'canvas/setResizing', payload: v })),
}))

jest.mock('@metabuilder/hooks', () => ({
  useUI: jest.fn(),
}))

jest.mock('../canvasItemOps', () => ({
  loadCanvasItems: jest.fn(),
  deleteCanvasItem: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { useUI } from '@metabuilder/hooks'
import { setResizing } from '@metabuilder/redux-slices'
import { loadCanvasItems as loadItems, deleteCanvasItem as deleteItem } from '../canvasItemOps'
import { useCanvasItems } from '../useCanvasItems'

const mockDispatch = jest.fn()
const mockShowError = jest.fn()
const mockShowSuccess = jest.fn()

const makeItem = (id = 'item-1') => ({
  id,
  projectId: 'proj-1',
  workflowId: 'wf-1',
  position: { x: 0, y: 0 },
  size: { width: 200, height: 150 },
  zIndex: 1,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

function setupMocks({
  projectId = 'proj-1',
  canvasItems = [makeItem()],
  isLoading = false,
  error = null as string | null,
  isResizing = false,
} = {}) {
  ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
  ;(useUI as jest.Mock).mockReturnValue({ error: mockShowError, success: mockShowSuccess })
  ;(useSelector as jest.Mock).mockImplementation((selector: any) => {
    if (selector.name === 'selectCurrentProjectId' || selector === require('@metabuilder/redux-slices').selectCurrentProjectId) return projectId
    if (selector === require('@metabuilder/redux-slices').selectCanvasItems) return canvasItems
    if (selector === require('@metabuilder/redux-slices').selectProjectIsLoading) return isLoading
    if (selector === require('@metabuilder/redux-slices').selectProjectError) return error
    if (selector === require('@metabuilder/redux-slices').selectIsResizing) return isResizing
    return undefined
  })
}

describe('useCanvasItems', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return canvasItems from selector', () => {
    const items = [makeItem('a'), makeItem('b')]
    setupMocks({ canvasItems: items })
    const { result } = renderHook(() => useCanvasItems())
    expect(result.current.canvasItems).toEqual(items)
  })

  it('should return isLoading from selector', () => {
    setupMocks({ isLoading: true })
    const { result } = renderHook(() => useCanvasItems())
    expect(result.current.isLoading).toBe(true)
  })

  it('should return error from selector', () => {
    setupMocks({ error: 'Some error' })
    const { result } = renderHook(() => useCanvasItems())
    expect(result.current.error).toBe('Some error')
  })

  it('should return isResizing from selector', () => {
    setupMocks({ isResizing: true })
    const { result } = renderHook(() => useCanvasItems())
    expect(result.current.isResizing).toBe(true)
  })

  it('should call loadItems on mount when projectId is set', async () => {
    setupMocks()
    ;(loadItems as jest.Mock).mockResolvedValue(undefined)

    renderHook(() => useCanvasItems())

    await act(async () => {
      await Promise.resolve()
    })

    expect(loadItems).toHaveBeenCalledWith('proj-1', mockDispatch, mockShowError)
  })

  it('should not call loadItems when projectId is not set', () => {
    setupMocks({ projectId: '' })
    renderHook(() => useCanvasItems())
    expect(loadItems).not.toHaveBeenCalled()
  })

  it('loadCanvasItems should call loadItems with projectId', async () => {
    setupMocks()
    ;(loadItems as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useCanvasItems())

    await act(async () => {
      await result.current.loadCanvasItems()
    })

    expect(loadItems).toHaveBeenCalledWith('proj-1', mockDispatch, mockShowError)
  })

  it('loadCanvasItems should not call loadItems when no projectId', async () => {
    setupMocks({ projectId: '' })
    ;(loadItems as jest.Mock).mockResolvedValue(undefined)
    jest.clearAllMocks()

    const { result } = renderHook(() => useCanvasItems())

    await act(async () => {
      await result.current.loadCanvasItems()
    })

    expect(loadItems).not.toHaveBeenCalled()
  })

  it('deleteCanvasItem should call deleteItem with correct args', async () => {
    setupMocks()
    ;(deleteItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useCanvasItems())

    await act(async () => {
      await result.current.deleteCanvasItem('item-1')
    })

    expect(deleteItem).toHaveBeenCalledWith('proj-1', 'item-1', mockDispatch, mockShowError, mockShowSuccess)
  })

  it('deleteCanvasItem should not call deleteItem when no projectId', async () => {
    setupMocks({ projectId: '' })
    ;(deleteItem as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useCanvasItems())

    await act(async () => {
      await result.current.deleteCanvasItem('item-1')
    })

    expect(deleteItem).not.toHaveBeenCalled()
  })

  it('setResizingState should dispatch setResizing', () => {
    setupMocks()
    const { result } = renderHook(() => useCanvasItems())

    act(() => {
      result.current.setResizingState(true)
    })

    expect(mockDispatch).toHaveBeenCalledWith(setResizing(true))
  })

  it('setResizingState(false) should dispatch setResizing(false)', () => {
    setupMocks()
    const { result } = renderHook(() => useCanvasItems())

    act(() => {
      result.current.setResizingState(false)
    })

    expect(mockDispatch).toHaveBeenCalledWith(setResizing(false))
  })

  it('should expose expected return shape', () => {
    setupMocks()
    const { result } = renderHook(() => useCanvasItems())

    expect(result.current).toHaveProperty('canvasItems')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('isResizing')
    expect(result.current).toHaveProperty('loadCanvasItems')
    expect(result.current).toHaveProperty('deleteCanvasItem')
    expect(result.current).toHaveProperty('setResizingState')
  })
})
