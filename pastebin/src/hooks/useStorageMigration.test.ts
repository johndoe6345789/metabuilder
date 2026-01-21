import { renderHook, act } from '@testing-library/react'
import { useStorageMigration } from './useStorageMigration'
import * as storageModule from '@/lib/storage'
import * as dbModule from '@/lib/db'
import * as sonerModule from 'sonner'

// Mock the modules
jest.mock('@/lib/storage')
jest.mock('@/lib/db')
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

const mockStorage = storageModule as jest.Mocked<typeof storageModule>
const mockDb = dbModule as jest.Mocked<typeof dbModule>
const mockToast = sonerModule.toast as jest.Mocked<typeof sonerModule.toast>

// Mock window.location.reload
delete (window as any).location
;(window as any).location = { reload: jest.fn() }

describe('useStorageMigration Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleMigrateToFlask', () => {
    it('should migrate snippets to Flask successfully', async () => {
      const mockSnippets = [
        {
          id: '1',
          title: 'Test Snippet',
          description: 'A test snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
        migrateFromIndexedDB: jest.fn().mockResolvedValueOnce(undefined),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockDb.getAllSnippets.mockResolvedValueOnce(mockSnippets)
      mockStorage.saveStorageConfig.mockImplementationOnce(jest.fn())

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000')
      })

      expect(mockAdapter.testConnection).toHaveBeenCalled()
      expect(mockDb.getAllSnippets).toHaveBeenCalled()
      expect(mockAdapter.migrateFromIndexedDB).toHaveBeenCalledWith(mockSnippets)
      expect(mockStorage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'flask',
        flaskUrl: 'http://localhost:5000',
      })
      expect(mockToast.success).toHaveBeenCalledWith(
        'Successfully migrated 1 snippets to Flask backend'
      )
    })

    it('should not migrate if URL is empty', async () => {
      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToFlask('')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Please enter a Flask backend URL')
      expect(mockDb.getAllSnippets).not.toHaveBeenCalled()
    })

    it('should not migrate if connection test fails', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(false),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Cannot connect to Flask backend')
      expect(mockDb.getAllSnippets).not.toHaveBeenCalled()
    })

    it('should handle case with no snippets to migrate', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockDb.getAllSnippets.mockResolvedValueOnce([])

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000')
      })

      expect(mockToast.info).toHaveBeenCalledWith('No snippets to migrate')
      expect(mockStorage.saveStorageConfig).not.toHaveBeenCalled()
    })

    it('should call onSuccess callback after migration', async () => {
      const mockSnippets = [
        {
          id: '1',
          title: 'Test Snippet',
          description: 'A test snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
        migrateFromIndexedDB: jest.fn().mockResolvedValueOnce(undefined),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockDb.getAllSnippets.mockResolvedValueOnce(mockSnippets)
      mockStorage.saveStorageConfig.mockImplementationOnce(jest.fn())

      const { result } = renderHook(() => useStorageMigration())
      const onSuccess = jest.fn().mockResolvedValueOnce(undefined)

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000', onSuccess)
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })

    it('should handle migration error', async () => {
      const error = new Error('Migration failed')

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
        migrateFromIndexedDB: jest.fn().mockRejectedValueOnce(error),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      const mockSnippets = [
        {
          id: '1',
          title: 'Test Snippet',
          description: 'A test snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      mockDb.getAllSnippets.mockResolvedValueOnce(mockSnippets)

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to migrate data to Flask backend')
    })

    it('should migrate multiple snippets', async () => {
      const mockSnippets = [
        {
          id: '1',
          title: 'Snippet 1',
          description: 'First snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
        {
          id: '2',
          title: 'Snippet 2',
          description: 'Second snippet',
          code: 'const y = 2',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
        {
          id: '3',
          title: 'Snippet 3',
          description: 'Third snippet',
          code: 'const z = 3',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
        migrateFromIndexedDB: jest.fn().mockResolvedValueOnce(undefined),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockDb.getAllSnippets.mockResolvedValueOnce(mockSnippets)
      mockStorage.saveStorageConfig.mockImplementationOnce(jest.fn())

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000')
      })

      expect(mockToast.success).toHaveBeenCalledWith(
        'Successfully migrated 3 snippets to Flask backend'
      )
    })
  })

  describe('handleMigrateToIndexedDB', () => {
    it('should migrate from Flask to IndexedDB successfully', async () => {
      const mockSnippets = [
        {
          id: '1',
          title: 'Test Snippet',
          description: 'A test snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValueOnce(mockSnippets),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.saveStorageConfig.mockImplementationOnce(jest.fn())

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000')
      })

      expect(mockAdapter.migrateToIndexedDB).toHaveBeenCalled()
      expect(mockStorage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'indexeddb',
      })
      expect(mockToast.success).toHaveBeenCalledWith(
        'Successfully migrated 1 snippets to IndexedDB'
      )
      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should not migrate if URL is empty', async () => {
      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Please enter a Flask backend URL')
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should handle case with no snippets to migrate', async () => {
      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValueOnce([]),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000')
      })

      expect(mockToast.info).toHaveBeenCalledWith('No snippets to migrate')
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should reload page after successful migration', async () => {
      const mockSnippets = [
        {
          id: '1',
          title: 'Test Snippet',
          description: 'A test snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValueOnce(mockSnippets),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.saveStorageConfig.mockImplementationOnce(jest.fn())

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000')
      })

      expect(window.location.reload).toHaveBeenCalledTimes(1)
    })

    it('should handle migration error', async () => {
      const error = new Error('Migration failed')

      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockRejectedValueOnce(error),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000')
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to migrate data from Flask backend')
      expect(window.location.reload).not.toHaveBeenCalled()
    })

    it('should migrate multiple snippets to IndexedDB', async () => {
      const mockSnippets = [
        {
          id: '1',
          title: 'Snippet 1',
          description: 'First snippet',
          code: 'const x = 1',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
        {
          id: '2',
          title: 'Snippet 2',
          description: 'Second snippet',
          code: 'const y = 2',
          language: 'javascript',
          tags: [],
          isTemplate: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
        },
      ]

      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValueOnce(mockSnippets),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.saveStorageConfig.mockImplementationOnce(jest.fn())

      const { result } = renderHook(() => useStorageMigration())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000')
      })

      expect(mockToast.success).toHaveBeenCalledWith(
        'Successfully migrated 2 snippets to IndexedDB'
      )
    })
  })

  describe('hook return value', () => {
    it('should return both migration handlers', () => {
      const { result } = renderHook(() => useStorageMigration())

      expect(typeof result.current.handleMigrateToFlask).toBe('function')
      expect(typeof result.current.handleMigrateToIndexedDB).toBe('function')
    })

    it('should maintain handler references across renders', () => {
      const { result, rerender } = renderHook(() => useStorageMigration())

      const initialHandlers = {
        flask: result.current.handleMigrateToFlask,
        indexeddb: result.current.handleMigrateToIndexedDB,
      }

      rerender()

      expect(result.current.handleMigrateToFlask).toBe(initialHandlers.flask)
      expect(result.current.handleMigrateToIndexedDB).toBe(initialHandlers.indexeddb)
    })
  })
})
