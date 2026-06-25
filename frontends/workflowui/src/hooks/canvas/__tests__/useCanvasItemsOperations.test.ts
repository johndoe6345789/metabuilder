/**
 * Tests for useCanvasItemsOperations hook
 */

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}))

jest.mock('@metabuilder/redux-slices', () => ({
  selectCurrentProjectId: jest.fn(),
}))

jest.mock('@metabuilder/hooks', () => ({
  useUI: jest.fn(),
}))

jest.mock('@metabuilder/services', () => ({
  projectService: {},
}))

jest.mock('../canvasItemsOps', () => ({
  createItem: jest.fn(),
  updateItem: jest.fn(),
  bulkUpdate: jest.fn(),
}))

import { renderHook, act } from '@testing-library/react'
import { useDispatch, useSelector } from 'react-redux'
import { useUI } from '@metabuilder/hooks'
import { createItem, updateItem, bulkUpdate } from '../canvasItemsOps'
import { useCanvasItemsOperations } from '../useCanvasItemsOperations'

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

function setupMocks(projectId = 'proj-1') {
  ;(useDispatch as jest.Mock).mockReturnValue(mockDispatch)
  ;(useUI as jest.Mock).mockReturnValue({ error: mockShowError, success: mockShowSuccess })
  ;(useSelector as jest.Mock).mockReturnValue(projectId)
}

describe('useCanvasItemsOperations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createCanvasItem', () => {
    it('should call createItem with projectId and data', async () => {
      setupMocks()
      const item = makeItem()
      ;(createItem as jest.Mock).mockResolvedValue(item)

      const { result } = renderHook(() => useCanvasItemsOperations())

      let returned: any
      await act(async () => {
        returned = await result.current.createCanvasItem({ workflowId: 'wf-1' } as any)
      })

      expect(createItem).toHaveBeenCalledWith('proj-1', { workflowId: 'wf-1' }, mockDispatch, mockShowError, mockShowSuccess)
      expect(returned).toEqual(item)
    })

    it('should return null when no projectId', async () => {
      setupMocks('')

      const { result } = renderHook(() => useCanvasItemsOperations())

      let returned: any
      await act(async () => {
        returned = await result.current.createCanvasItem({} as any)
      })

      expect(createItem).not.toHaveBeenCalled()
      expect(returned).toBeNull()
    })
  })

  describe('updateCanvasItem', () => {
    it('should call updateItem with projectId, itemId, and data', async () => {
      setupMocks()
      const item = makeItem()
      ;(updateItem as jest.Mock).mockResolvedValue(item)

      const { result } = renderHook(() => useCanvasItemsOperations())

      let returned: any
      await act(async () => {
        returned = await result.current.updateCanvasItem('item-1', { position: { x: 10, y: 20 } } as any)
      })

      expect(updateItem).toHaveBeenCalledWith('proj-1', 'item-1', { position: { x: 10, y: 20 } }, mockDispatch, mockShowError)
      expect(returned).toEqual(item)
    })

    it('should return null when no projectId', async () => {
      setupMocks('')

      const { result } = renderHook(() => useCanvasItemsOperations())

      let returned: any
      await act(async () => {
        returned = await result.current.updateCanvasItem('item-1', {} as any)
      })

      expect(updateItem).not.toHaveBeenCalled()
      expect(returned).toBeNull()
    })
  })

  describe('bulkUpdateItems', () => {
    it('should call bulkUpdate with projectId and updates', async () => {
      setupMocks()
      ;(bulkUpdate as jest.Mock).mockResolvedValue(undefined)

      const { result } = renderHook(() => useCanvasItemsOperations())

      await act(async () => {
        await result.current.bulkUpdateItems([{ id: 'item-1', position: { x: 5, y: 5 } }])
      })

      expect(bulkUpdate).toHaveBeenCalledWith(
        'proj-1',
        [{ id: 'item-1', position: { x: 5, y: 5 } }],
        mockDispatch,
        mockShowError
      )
    })

    it('should return early when no projectId', async () => {
      setupMocks('')

      const { result } = renderHook(() => useCanvasItemsOperations())

      await act(async () => {
        await result.current.bulkUpdateItems([{ id: 'item-1' }])
      })

      expect(bulkUpdate).not.toHaveBeenCalled()
    })
  })

  it('should expose expected return shape', () => {
    setupMocks()
    const { result } = renderHook(() => useCanvasItemsOperations())

    expect(result.current).toHaveProperty('createCanvasItem')
    expect(result.current).toHaveProperty('updateCanvasItem')
    expect(result.current).toHaveProperty('bulkUpdateItems')
    expect(typeof result.current.createCanvasItem).toBe('function')
    expect(typeof result.current.updateCanvasItem).toBe('function')
    expect(typeof result.current.bulkUpdateItems).toBe('function')
  })
})
