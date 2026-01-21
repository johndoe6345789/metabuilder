import { renderHook, act } from '@testing-library/react'
import { useDatabaseOperations } from './useDatabaseOperations'
import * as dbModule from '@/lib/db'
import * as sonerModule from 'sonner'

// Mock the database module
jest.mock('@/lib/db')

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

const mockDb = dbModule as jest.Mocked<typeof dbModule>
const mockToast = sonerModule.toast as jest.Mocked<typeof sonerModule.toast>

describe('useDatabaseOperations Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('loadStats', () => {
    it('should load database stats successfully', async () => {
      const mockStats = {
        snippetCount: 10,
        templateCount: 5,
        namespaceCount: 2,
        storageType: 'indexeddb' as const,
        databaseSize: 1024,
      }
      mockDb.getDatabaseStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDatabaseOperations())

      expect(result.current.loading).toBe(true)

      await act(async () => {
        await result.current.loadStats()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.stats).toEqual(mockStats)
      expect(mockDb.getDatabaseStats).toHaveBeenCalledTimes(1)
    })

    it('should handle errors when loading stats', async () => {
      const error = new Error('Database error')
      mockDb.getDatabaseStats.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.loadStats()
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.stats).toBeNull()
      expect(mockToast.error).toHaveBeenCalledWith('Failed to load database statistics')
    })
  })

  describe('checkSchemaHealth', () => {
    it('should check schema health successfully', async () => {
      mockDb.validateDatabaseSchema.mockResolvedValueOnce(true)

      const { result } = renderHook(() => useDatabaseOperations())

      expect(result.current.schemaHealth).toBe('unknown')

      await act(async () => {
        await result.current.checkSchemaHealth()
      })

      expect(result.current.schemaHealth).toBe('healthy')
      expect(result.current.checkingSchema).toBe(false)
    })

    it('should set corrupted state when schema is invalid', async () => {
      mockDb.validateDatabaseSchema.mockResolvedValueOnce(false)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.checkSchemaHealth()
      })

      expect(result.current.schemaHealth).toBe('corrupted')
    })

    it('should handle errors during schema check', async () => {
      const error = new Error('Schema check failed')
      mockDb.validateDatabaseSchema.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.checkSchemaHealth()
      })

      expect(result.current.schemaHealth).toBe('corrupted')
      expect(result.current.checkingSchema).toBe(false)
    })
  })

  describe('handleExport', () => {
    it('should export database successfully', async () => {
      const mockJsonData = '{"data": "test"}'
      mockDb.exportDatabase.mockResolvedValueOnce(mockJsonData)

      // Mock DOM methods
      const mockUrl = 'blob:http://test'
      const mockLink = document.createElement('a')

      global.URL.createObjectURL = jest.fn(() => mockUrl)
      global.URL.revokeObjectURL = jest.fn()
      jest.spyOn(document, 'createElement').mockReturnValueOnce(mockLink)
      jest.spyOn(document.body, 'appendChild').mockReturnValueOnce(mockLink)
      jest.spyOn(document.body, 'removeChild').mockReturnValueOnce(mockLink)
      jest.spyOn(mockLink, 'click').mockReturnValueOnce()

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleExport()
      })

      expect(mockDb.exportDatabase).toHaveBeenCalledTimes(1)
      expect(mockToast.success).toHaveBeenCalledWith('Database exported successfully')
    })

    it('should handle export errors', async () => {
      const error = new Error('Export failed')
      mockDb.exportDatabase.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleExport()
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to export database')
    })
  })

  describe('handleImport', () => {
    it('should handle no file selected', async () => {
      const { result } = renderHook(() => useDatabaseOperations())

      const mockEvent = {
        target: {
          files: null,
          value: '',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleImport(mockEvent)
      })

      expect(mockDb.importDatabase).not.toHaveBeenCalled()
    })

    it('should import database successfully', async () => {
      mockDb.importDatabase.mockResolvedValueOnce(undefined)
      const mockStats = {
        snippetCount: 20,
        templateCount: 10,
        namespaceCount: 3,
        storageType: 'indexeddb' as const,
        databaseSize: 2048,
      }
      mockDb.getDatabaseStats.mockResolvedValueOnce(mockStats)

      const { result } = renderHook(() => useDatabaseOperations())

      const jsonData = JSON.stringify({ data: 'test' })
      const mockFile = new File([jsonData], 'backup.json', { type: 'application/json' })

      // Mock the File.text() method which returns a Promise
      mockFile.text = jest.fn().mockResolvedValueOnce(jsonData)

      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'backup.json',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleImport(mockEvent)
      })

      expect(mockDb.importDatabase).toHaveBeenCalled()
      expect(mockToast.success).toHaveBeenCalledWith('Database imported successfully')
    })

    it('should clear file input after import', async () => {
      mockDb.importDatabase.mockResolvedValueOnce(undefined)
      mockDb.getDatabaseStats.mockResolvedValueOnce({
        snippetCount: 0,
        templateCount: 0,
        namespaceCount: 0,
        storageType: 'indexeddb' as const,
        databaseSize: 0,
      })

      const { result } = renderHook(() => useDatabaseOperations())

      const mockEvent = {
        target: {
          files: [new File([], 'test.json')],
          value: 'test.json',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleImport(mockEvent)
      })

      expect(mockEvent.target.value).toBe('')
    })

    it('should handle import errors', async () => {
      const error = new Error('Import failed')
      mockDb.importDatabase.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDatabaseOperations())

      const mockEvent = {
        target: {
          files: [new File([], 'test.json')],
          value: 'test.json',
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      await act(async () => {
        await result.current.handleImport(mockEvent)
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to import database')
    })
  })

  describe('handleClear', () => {
    beforeEach(() => {
      global.confirm = jest.fn(() => true)
    })

    it('should clear database when confirmed', async () => {
      mockDb.clearDatabase.mockResolvedValueOnce(undefined)
      mockDb.getDatabaseStats.mockResolvedValueOnce({
        snippetCount: 0,
        templateCount: 0,
        namespaceCount: 0,
        storageType: 'indexeddb' as const,
        databaseSize: 0,
      })
      mockDb.validateDatabaseSchema.mockResolvedValueOnce(true)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleClear()
      })

      expect(global.confirm).toHaveBeenCalled()
      expect(mockDb.clearDatabase).toHaveBeenCalledTimes(1)
      expect(mockToast.success).toHaveBeenCalledWith('Database cleared and schema recreated successfully')
    })

    it('should not clear database when not confirmed', async () => {
      global.confirm = jest.fn(() => false)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleClear()
      })

      expect(mockDb.clearDatabase).not.toHaveBeenCalled()
    })

    it('should handle clear errors', async () => {
      const error = new Error('Clear failed')
      mockDb.clearDatabase.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleClear()
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to clear database')
    })
  })

  describe('handleSeed', () => {
    it('should seed database successfully', async () => {
      mockDb.seedDatabase.mockResolvedValueOnce(undefined)
      mockDb.getDatabaseStats.mockResolvedValueOnce({
        snippetCount: 5,
        templateCount: 3,
        namespaceCount: 1,
        storageType: 'indexeddb' as const,
        databaseSize: 512,
      })

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleSeed()
      })

      expect(mockDb.seedDatabase).toHaveBeenCalledTimes(1)
      expect(mockToast.success).toHaveBeenCalledWith('Sample data added successfully')
    })

    it('should handle seed errors', async () => {
      const error = new Error('Seed failed')
      mockDb.seedDatabase.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useDatabaseOperations())

      await act(async () => {
        await result.current.handleSeed()
      })

      expect(mockToast.error).toHaveBeenCalledWith('Failed to add sample data')
    })
  })

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      const { result } = renderHook(() => useDatabaseOperations())

      expect(result.current.formatBytes(0)).toBe('0 Bytes')
      expect(result.current.formatBytes(1024)).toBe('1 KB')
      expect(result.current.formatBytes(1048576)).toBe('1 MB')
      expect(result.current.formatBytes(1073741824)).toBe('1 GB')
    })

    it('should handle decimal values', () => {
      const { result } = renderHook(() => useDatabaseOperations())

      const formatted = result.current.formatBytes(1536) // 1.5 KB
      expect(formatted).toMatch(/1\.5\s*KB/)
    })
  })
})
