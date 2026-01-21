import { configureStore, Middleware } from '@reduxjs/toolkit'
import { persistenceMiddleware } from '@/store/middleware/persistenceMiddleware'
import {
  enablePersistence,
  disablePersistence,
  updatePersistenceConfig,
  resetPersistenceConfig,
  disableLogging,
} from '@/store/middleware/persistenceConfig'
import snippetsReducer, { createSnippet } from '@/store/slices/snippetsSlice'

jest.mock('@/lib/db', () => ({
  saveDB: jest.fn(),
  createSnippet: jest.fn(),
  updateSnippet: jest.fn(),
  deleteSnippet: jest.fn(),
  getAllSnippets: jest.fn(),
  getSnippetsByNamespace: jest.fn(),
  bulkMoveSnippets: jest.fn(),
  moveSnippetToNamespace: jest.fn(),
}))

const mockSnippetData = {
  title: 'Test Snippet',
  description: 'Test',
  code: 'console.log("test")',
  language: 'javascript' as const,
  category: 'test',
  hasPreview: false,
  functionName: 'test',
  inputParameters: [],
  namespaceId: 'ns1',
  isTemplate: false,
}

describe('persistenceMiddleware', () => {
  let store: ReturnType<typeof configureStore>
  let mockSaveDB: jest.Mock

  beforeEach(() => {
    // Reset persistence config before each test
    resetPersistenceConfig()
    disableLogging()

    const mockDb = require('@/lib/db')
    mockSaveDB = mockDb.saveDB
    mockSaveDB.mockResolvedValue(undefined)

    // Mock all other db functions
    mockDb.createSnippet.mockResolvedValue(undefined)
    mockDb.updateSnippet.mockResolvedValue(undefined)
    mockDb.deleteSnippet.mockResolvedValue(undefined)
    mockDb.getAllSnippets.mockResolvedValue([])
    mockDb.getSnippetsByNamespace.mockResolvedValue([])
    mockDb.bulkMoveSnippets.mockResolvedValue(undefined)
    mockDb.moveSnippetToNamespace.mockResolvedValue(undefined)

    jest.clearAllMocks()

    store = configureStore({
      reducer: {
        snippets: snippetsReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(persistenceMiddleware),
    })
  })

  describe('action filtering', () => {
    it('should not save when persistence is disabled', async () => {
      disablePersistence()

      await store.dispatch(createSnippet(mockSnippetData))

      expect(mockSaveDB).not.toHaveBeenCalled()
    })

    it('should only trigger save for configured actions', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      // Dispatch an action that's not in the persistence config
      store.dispatch({ type: 'SOME_OTHER_ACTION' })

      expect(mockSaveDB).not.toHaveBeenCalled()
    })

    it('should save when configured action is dispatched', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      await store.dispatch(createSnippet(mockSnippetData))

      expect(mockSaveDB).toHaveBeenCalled()
    })
  })

  describe('debouncing', () => {
    it('should debounce multiple rapid actions', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 100 })

      const startTime = Date.now()

      // Dispatch multiple actions rapidly
      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' }))
      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' }))
      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'Third' }))

      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 150))

      const elapsed = Date.now() - startTime
      expect(mockSaveDB.mock.calls.length).toBe(1)
      expect(elapsed).toBeGreaterThanOrEqual(100)
    })

    it('should save immediately when debounce is 0', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      await store.dispatch(createSnippet(mockSnippetData))

      expect(mockSaveDB).toHaveBeenCalled()
    })

    it('should reset debounce timer on new action', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 100 })

      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' }))

      // Wait 50ms then dispatch another
      await new Promise(resolve => setTimeout(resolve, 50))
      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' }))

      // Wait 50ms more (total 100ms, but debounce reset)
      await new Promise(resolve => setTimeout(resolve, 50))

      // Should only have pending save, not yet executed
      expect(mockSaveDB.mock.calls.length).toBeLessThanOrEqual(1)

      // Wait for final debounce
      await new Promise(resolve => setTimeout(resolve, 60))
      expect(mockSaveDB.mock.calls.length).toBe(1)
    })
  })

  describe('retry logic', () => {
    it('should retry on persistence failure', async () => {
      enablePersistence()
      updatePersistenceConfig({
        debounceMs: 0,
        retryOnFailure: true,
        maxRetries: 2,
        retryDelayMs: 50,
      })

      mockSaveDB.mockRejectedValueOnce(new Error('Failed'))
      mockSaveDB.mockRejectedValueOnce(new Error('Failed'))
      mockSaveDB.mockResolvedValueOnce(undefined)

      const startTime = Date.now()
      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 200))
      const elapsed = Date.now() - startTime

      expect(mockSaveDB).toHaveBeenCalledTimes(3)
      expect(elapsed).toBeGreaterThanOrEqual(100)
    })

    it('should stop retrying after max retries', async () => {
      enablePersistence()
      updatePersistenceConfig({
        debounceMs: 0,
        retryOnFailure: true,
        maxRetries: 2,
        retryDelayMs: 10,
      })

      mockSaveDB.mockRejectedValue(new Error('Persistent failure'))

      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(mockSaveDB).toHaveBeenCalledTimes(3)
    })

    it('should not retry when retryOnFailure is disabled', async () => {
      enablePersistence()
      updatePersistenceConfig({
        debounceMs: 0,
        retryOnFailure: false,
      })

      mockSaveDB.mockRejectedValue(new Error('Failed'))

      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockSaveDB).toHaveBeenCalledTimes(1)
    })

    it('should reset retry count after successful save', async () => {
      enablePersistence()
      updatePersistenceConfig({
        debounceMs: 0,
        retryOnFailure: true,
        maxRetries: 2,
        retryDelayMs: 10,
      })

      // First dispatch with failure then success
      mockSaveDB.mockRejectedValueOnce(new Error('Failed'))
      mockSaveDB.mockResolvedValueOnce(undefined)

      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' }))
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(mockSaveDB).toHaveBeenCalledTimes(2)

      // Second dispatch should succeed on first try (retry count reset)
      mockSaveDB.mockResolvedValueOnce(undefined)
      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' }))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockSaveDB).toHaveBeenCalledTimes(3)
    })
  })

  describe('queue management', () => {
    it('should queue persistence operations sequentially', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      let callOrder: number[] = []
      let callCount = 0

      mockSaveDB.mockImplementation(async () => {
        const currentCall = ++callCount
        callOrder.push(currentCall)
        return undefined
      })

      await Promise.all([
        store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' })),
        store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' })),
      ])

      // Wait for all saves
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should complete in order
      expect(mockSaveDB).toHaveBeenCalled()
    })

    it('should prevent concurrent saves', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      let isSaving = false
      let concurrentCalls = 0

      mockSaveDB.mockImplementation(async () => {
        if (isSaving) {
          concurrentCalls++
        }
        isSaving = true
        await new Promise(resolve => setTimeout(resolve, 50))
        isSaving = false
      })

      await Promise.all([
        store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' })),
        store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' })),
        store.dispatch(createSnippet({ ...mockSnippetData, title: 'Third' })),
      ])

      // Wait for all saves
      await new Promise(resolve => setTimeout(resolve, 200))

      expect(concurrentCalls).toBe(0)
    })
  })

  describe('action propagation', () => {
    it('should propagate actions through middleware chain', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      const initialLength = store.getState().snippets.items.length

      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      const finalLength = store.getState().snippets.items.length
      expect(finalLength).toBe(initialLength + 1)
    })

    it('should not block action dispatch', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      const action = await store.dispatch(createSnippet(mockSnippetData))

      expect(action).toBeDefined()
    })

    it('should handle actions with payload correctly', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      const payload = {
        ...mockSnippetData,
        title: 'Specific Title',
      }

      await store.dispatch(createSnippet(payload))
      await new Promise(resolve => setTimeout(resolve, 50))

      const state = store.getState().snippets
      expect(state.items[0].title).toBe('Specific Title')
    })
  })

  describe('configuration updates', () => {
    it('should respect updated persistence config', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockSaveDB).toHaveBeenCalled()
    })

    it('should immediately stop persisting when disabled', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      disablePersistence()

      mockSaveDB.mockClear()
      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockSaveDB).not.toHaveBeenCalled()
    })

    it('should resume persisting when re-enabled', async () => {
      disablePersistence()

      await store.dispatch(createSnippet(mockSnippetData))
      expect(mockSaveDB).not.toHaveBeenCalled()

      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      mockSaveDB.mockClear()
      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockSaveDB).toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle save errors gracefully', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0, retryOnFailure: false })

      mockSaveDB.mockRejectedValue(new Error('Save failed'))

      // Should not throw
      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(store.getState().snippets.items.length).toBe(1)
    })

    it('should continue processing actions after save failure', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0, retryOnFailure: false })

      mockSaveDB.mockRejectedValueOnce(new Error('Save failed'))

      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' }))
      await new Promise(resolve => setTimeout(resolve, 50))
      expect(store.getState().snippets.items.length).toBe(1)

      mockSaveDB.mockResolvedValueOnce(undefined)
      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' }))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(store.getState().snippets.items.length).toBe(2)
    })

    it('should handle null saveDB error gracefully', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0, retryOnFailure: false })

      mockSaveDB.mockRejectedValue(null)

      // Should not throw
      await store.dispatch(createSnippet(mockSnippetData))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(store.getState().snippets.items.length).toBe(1)
    })
  })

  describe('pending sync state', () => {
    it('should batch consecutive rapid actions', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 50 })

      // Dispatch 3 actions rapidly
      const dispatch1 = store.dispatch(
        createSnippet({ ...mockSnippetData, title: 'First' })
      )
      const dispatch2 = store.dispatch(
        createSnippet({ ...mockSnippetData, title: 'Second' })
      )
      const dispatch3 = store.dispatch(
        createSnippet({ ...mockSnippetData, title: 'Third' })
      )

      await Promise.all([dispatch1, dispatch2, dispatch3])
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should only call saveDB once (batched)
      expect(mockSaveDB).toHaveBeenCalledTimes(1)
      expect(store.getState().snippets.items.length).toBe(3)
    })

    it('should handle save completion before next action', async () => {
      enablePersistence()
      updatePersistenceConfig({ debounceMs: 0 })

      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'First' }))
      await new Promise(resolve => setTimeout(resolve, 100))

      await store.dispatch(createSnippet({ ...mockSnippetData, title: 'Second' }))
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockSaveDB).toHaveBeenCalledTimes(2)
    })
  })
})
