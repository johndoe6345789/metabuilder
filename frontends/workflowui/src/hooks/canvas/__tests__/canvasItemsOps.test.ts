/**
 * Tests for canvasItemsOps - create/update/bulk operations for canvas items
 */

// Mock dependencies
jest.mock('@metabuilder/redux-slices', () => ({
  setProjectLoading: jest.fn((v) => ({ type: 'project/setLoading', payload: v })),
  setProjectError: jest.fn((v) => ({ type: 'project/setError', payload: v })),
  addCanvasItem: jest.fn((v) => ({ type: 'canvas/addItem', payload: v })),
  updateCanvasItem: jest.fn((v) => ({ type: 'canvas/updateItem', payload: v })),
  bulkUpdateCanvasItems: jest.fn((v) => ({ type: 'canvas/bulkUpdate', payload: v })),
}))

jest.mock('@metabuilder/services', () => ({
  projectService: {
    createCanvasItem: jest.fn(),
    updateCanvasItem: jest.fn(),
    bulkUpdateCanvasItems: jest.fn(),
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

import { createItem, updateItem, bulkUpdate } from '../canvasItemsOps'
import { projectService } from '@metabuilder/services'
import {
  setProjectLoading, setProjectError, addCanvasItem,
  updateCanvasItem as updateCanvasItemAction, bulkUpdateCanvasItems,
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

describe('canvasItemsOps', () => {
  const mockDispatch = jest.fn()
  const mockShowError = jest.fn()
  const mockShowSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createItem', () => {
    it('should create item and dispatch actions on success', async () => {
      const item = makeItem()
      ;(projectService.createCanvasItem as jest.Mock).mockResolvedValue(item)

      const result = await createItem('proj-1', { workflowId: 'wf-1' } as any, mockDispatch, mockShowError, mockShowSuccess)

      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(true))
      expect(projectService.createCanvasItem).toHaveBeenCalledWith('proj-1', { workflowId: 'wf-1' })
      expect(mockDispatch).toHaveBeenCalledWith(addCanvasItem(item))
      expect(mockShowSuccess).toHaveBeenCalledWith('Workflow added to canvas')
      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(false))
      expect(result).toEqual(item)
    })

    it('should dispatch error and rethrow on failure', async () => {
      const error = new Error('Service error')
      ;(projectService.createCanvasItem as jest.Mock).mockRejectedValue(error)

      await expect(
        createItem('proj-1', { workflowId: 'wf-1' } as any, mockDispatch, mockShowError, mockShowSuccess)
      ).rejects.toThrow('Service error')

      expect(mockDispatch).toHaveBeenCalledWith(setProjectError('Service error'))
      expect(mockShowError).toHaveBeenCalledWith('Service error')
      expect(mockDispatch).toHaveBeenCalledWith(setProjectLoading(false))
    })

    it('should use generic message for non-Error rejections', async () => {
      ;(projectService.createCanvasItem as jest.Mock).mockRejectedValue('Unknown error')

      await expect(
        createItem('proj-1', {} as any, mockDispatch, mockShowError, mockShowSuccess)
      ).rejects.toBe('Unknown error')

      expect(mockShowError).toHaveBeenCalledWith('Failed to add workflow to canvas')
    })
  })

  describe('updateItem', () => {
    it('should update item and dispatch actions on success', async () => {
      const updated = makeItem()
      ;(projectService.updateCanvasItem as jest.Mock).mockResolvedValue(updated)

      const result = await updateItem('proj-1', 'item-1', { position: { x: 10, y: 20 } } as any, mockDispatch, mockShowError)

      expect(projectService.updateCanvasItem).toHaveBeenCalledWith('proj-1', 'item-1', { position: { x: 10, y: 20 } })
      expect(mockDispatch).toHaveBeenCalledWith(updateCanvasItemAction({ ...updated, id: 'item-1' }))
      expect(result).toEqual(updated)
    })

    it('should dispatch error and rethrow on failure', async () => {
      const error = new Error('Update failed')
      ;(projectService.updateCanvasItem as jest.Mock).mockRejectedValue(error)

      await expect(
        updateItem('proj-1', 'item-1', {} as any, mockDispatch, mockShowError)
      ).rejects.toThrow('Update failed')

      expect(mockDispatch).toHaveBeenCalledWith(setProjectError('Update failed'))
      expect(mockShowError).toHaveBeenCalledWith('Update failed')
    })

    it('should use generic message for non-Error rejections', async () => {
      ;(projectService.updateCanvasItem as jest.Mock).mockRejectedValue(null)

      await expect(
        updateItem('proj-1', 'item-1', {} as any, mockDispatch, mockShowError)
      ).rejects.toBeNull()

      expect(mockShowError).toHaveBeenCalledWith('Failed to update canvas item')
    })
  })

  describe('bulkUpdate', () => {
    it('should bulk update items and dispatch actions on success', async () => {
      const items = [makeItem('item-1'), makeItem('item-2')]
      ;(projectService.bulkUpdateCanvasItems as jest.Mock).mockResolvedValue({ items })

      await bulkUpdate('proj-1', [{ id: 'item-1', position: { x: 10, y: 20 } }], mockDispatch, mockShowError)

      expect(projectService.bulkUpdateCanvasItems).toHaveBeenCalledWith(
        'proj-1',
        { items: [{ id: 'item-1', position: { x: 10, y: 20 } }] }
      )
      expect(mockDispatch).toHaveBeenCalledWith(bulkUpdateCanvasItems(items))
    })

    it('should dispatch error and rethrow on failure', async () => {
      const error = new Error('Bulk update failed')
      ;(projectService.bulkUpdateCanvasItems as jest.Mock).mockRejectedValue(error)

      await expect(
        bulkUpdate('proj-1', [], mockDispatch, mockShowError)
      ).rejects.toThrow('Bulk update failed')

      expect(mockDispatch).toHaveBeenCalledWith(setProjectError('Bulk update failed'))
      expect(mockShowError).toHaveBeenCalledWith('Bulk update failed')
    })

    it('should use generic message for non-Error rejections', async () => {
      ;(projectService.bulkUpdateCanvasItems as jest.Mock).mockRejectedValue('fail')

      await expect(
        bulkUpdate('proj-1', [], mockDispatch, mockShowError)
      ).rejects.toBe('fail')

      expect(mockShowError).toHaveBeenCalledWith('Failed to update canvas items')
    })
  })
})
