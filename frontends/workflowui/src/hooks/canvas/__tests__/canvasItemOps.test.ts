/**
 * Tests for canvasItemOps - load and delete canvas item operations
 */

jest.mock('@metabuilder/redux-slices', () => ({
  setCanvasItems: jest.fn((v) => ({ type: 'canvas/setItems', payload: v })),
  removeCanvasItem: jest.fn((v) => ({ type: 'canvas/removeItem', payload: v })),
  setProjectLoading: jest.fn((v) => ({ type: 'project/setLoading', payload: v })),
  setProjectError: jest.fn((v) => ({ type: 'project/setError', payload: v })),
}))

jest.mock('@metabuilder/services', () => ({
  projectService: {
    getCanvasItems: jest.fn(),
    deleteCanvasItem: jest.fn(),
  },
}))

jest.mock('dexie', () => {
  class MockDexie {
    workflows = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }
    executions = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }
    nodeTypes = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }
    drafts = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }
    syncQueue = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]), add: jest.fn().mockResolvedValue(1) }
    workspaces = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }
    projects = { where: jest.fn().mockReturnThis(), equals: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) }
    projectCanvasItems = {
      add: jest.fn().mockResolvedValue('item-id'),
      put: jest.fn().mockResolvedValue('item-id'),
      get: jest.fn().mockResolvedValue(null),
      delete: jest.fn().mockResolvedValue(undefined),
      bulkPut: jest.fn().mockResolvedValue(undefined),
      where: jest.fn().mockReturnThis(),
      equals: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([]),
    }
    version(_v: number) { return { stores: jest.fn().mockReturnThis() } }
  }
  const M = MockDexie as any; M.default = MockDexie; return M
})

import { loadCanvasItems, deleteCanvasItem } from '../canvasItemOps'
import { projectService } from '@metabuilder/services'
import {
  setCanvasItems, removeCanvasItem,
  setProjectLoading, setProjectError,
} from '@metabuilder/redux-slices'

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

describe('canvasItemOps', () => {
  const mockDispatch = jest.fn()
  const mockShowError = jest.fn()
  const mockShowSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadCanvasItems', () => {
    it('should dispatch loading, fetch items, and dispatch them on success', async () => {
      const items = [makeItem('item-1'), makeItem('item-2')]
      ;(projectService.getCanvasItems as jest.Mock).mockResolvedValue({ items })

      await loadCanvasItems('proj-1', mockDispatch, mockShowError)

      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(true))
      expect(projectService.getCanvasItems).toHaveBeenCalledWith('proj-1')
      expect(mockDispatch).toHaveBeenCalledWith(setCanvasItems(items))
      expect(mockDispatch).toHaveBeenCalledWith(setProjectError(null))
      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(false))
    })

    it('should dispatch error on failure with Error instance', async () => {
      const error = new Error('Fetch failed')
      ;(projectService.getCanvasItems as jest.Mock).mockRejectedValue(error)

      await loadCanvasItems('proj-1', mockDispatch, mockShowError)

      expect(mockDispatch).toHaveBeenCalledWith(setProjectError('Fetch failed'))
      expect(mockShowError).toHaveBeenCalledWith('Fetch failed')
      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(false))
    })

    it('should use generic message for non-Error rejections', async () => {
      ;(projectService.getCanvasItems as jest.Mock).mockRejectedValue('unknown')

      await loadCanvasItems('proj-1', mockDispatch, mockShowError)

      expect(mockDispatch).toHaveBeenCalledWith(setProjectError('Failed to load canvas items'))
      expect(mockShowError).toHaveBeenCalledWith('Failed to load canvas items')
    })

    it('should always dispatch setProjectLoading(false) in finally', async () => {
      ;(projectService.getCanvasItems as jest.Mock).mockRejectedValue(new Error('err'))

      await loadCanvasItems('proj-1', mockDispatch, mockShowError)

      const calls = (mockDispatch as jest.Mock).mock.calls.map((c: any[]) => c[0])
      const lastCall = calls[calls.length - 1]
      expect(lastCall).toEqual(setProjectLoading(false))
    })
  })

  describe('deleteCanvasItem', () => {
    it('should dispatch loading, delete item, dispatch removeCanvasItem, and show success', async () => {
      ;(projectService.deleteCanvasItem as jest.Mock).mockResolvedValue(undefined)

      await deleteCanvasItem('proj-1', 'item-1', mockDispatch, mockShowError, mockShowSuccess)

      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(true))
      expect(projectService.deleteCanvasItem).toHaveBeenCalledWith('proj-1', 'item-1')
      expect(mockDispatch).toHaveBeenCalledWith(removeCanvasItem('item-1'))
      expect(mockShowSuccess).toHaveBeenCalledWith('Workflow removed from canvas')
      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(false))
    })

    it('should dispatch error, show error, and rethrow on failure', async () => {
      const error = new Error('Delete failed')
      ;(projectService.deleteCanvasItem as jest.Mock).mockRejectedValue(error)

      await expect(
        deleteCanvasItem('proj-1', 'item-1', mockDispatch, mockShowError, mockShowSuccess)
      ).rejects.toThrow('Delete failed')

      expect(mockDispatch).toHaveBeenCalledWith(setProjectError('Delete failed'))
      expect(mockShowError).toHaveBeenCalledWith('Delete failed')
    })

    it('should use generic message for non-Error rejections', async () => {
      ;(projectService.deleteCanvasItem as jest.Mock).mockRejectedValue(null)

      await expect(
        deleteCanvasItem('proj-1', 'item-1', mockDispatch, mockShowError, mockShowSuccess)
      ).rejects.toBeNull()

      expect(mockShowError).toHaveBeenCalledWith('Failed to remove from canvas')
    })

    it('should always dispatch setProjectLoading(false) after error', async () => {
      ;(projectService.deleteCanvasItem as jest.Mock).mockRejectedValue(new Error('err'))

      try {
        await deleteCanvasItem('proj-1', 'item-1', mockDispatch, mockShowError, mockShowSuccess)
      } catch {
        // expected
      }

      const calls = (mockDispatch as jest.Mock).mock.calls.map((c: any[]) => c[0])
      const lastCall = calls[calls.length - 1]
      expect(lastCall).toEqual(setProjectLoading(false))
    })
  })
})
