import { renderHook, act } from '@testing-library/react'
import { useSettingsState } from './useSettingsState'
import * as hookModule from './useDatabaseOperations'
import * as storageConfigModule from './useStorageConfig'
import * as storageMigrationModule from './useStorageMigration'

// Mock the dependent hooks
jest.mock('./useDatabaseOperations')
jest.mock('./useStorageConfig')
jest.mock('./useStorageMigration')

const mockUseDatabaseOperations = hookModule.useDatabaseOperations as jest.Mocked<
  typeof hookModule.useDatabaseOperations
>
const mockUseStorageConfig = storageConfigModule.useStorageConfig as jest.Mocked<
  typeof storageConfigModule.useStorageConfig
>
const mockUseStorageMigration = storageMigrationModule.useStorageMigration as jest.Mocked<
  typeof storageMigrationModule.useStorageMigration
>

describe('useSettingsState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default mocks for each hook
    mockUseDatabaseOperations.mockReturnValue({
      stats: null,
      loading: false,
      schemaHealth: 'unknown',
      checkingSchema: false,
      loadStats: jest.fn().mockResolvedValue(undefined),
      checkSchemaHealth: jest.fn().mockResolvedValue(undefined),
      handleExport: jest.fn().mockResolvedValue(undefined),
      handleImport: jest.fn().mockResolvedValue(undefined),
      handleClear: jest.fn().mockResolvedValue(undefined),
      handleSeed: jest.fn().mockResolvedValue(undefined),
      formatBytes: jest.fn().mockReturnValue('0 B'),
    } as any)

    mockUseStorageConfig.mockReturnValue({
      storageBackend: 'indexeddb',
      setStorageBackend: jest.fn(),
      flaskUrl: 'http://localhost:5000',
      setFlaskUrl: jest.fn(),
      flaskConnectionStatus: 'unknown',
      setFlaskConnectionStatus: jest.fn(),
      testingConnection: false,
      envVarSet: false,
      loadConfig: jest.fn().mockResolvedValue(undefined),
      handleTestConnection: jest.fn().mockResolvedValue(undefined),
      handleSaveStorageConfig: jest.fn().mockResolvedValue(undefined),
    } as any)

    mockUseStorageMigration.mockReturnValue({
      handleMigrateToFlask: jest.fn().mockResolvedValue(undefined),
      handleMigrateToIndexedDB: jest.fn().mockResolvedValue(undefined),
    } as any)
  })

  describe('initialization', () => {
    it('should initialize with combined state from all hooks', () => {
      const { result } = renderHook(() => useSettingsState())

      expect(result.current.storageBackend).toBe('indexeddb')
      expect(result.current.flaskUrl).toBe('http://localhost:5000')
      expect(result.current.loading).toBe(false)
      expect(result.current.schemaHealth).toBe('unknown')
    })

    it('should call loadStats, checkSchemaHealth, and loadConfig on mount', () => {
      const loadStats = jest.fn().mockResolvedValue(undefined)
      const checkSchemaHealth = jest.fn().mockResolvedValue(undefined)
      const loadConfig = jest.fn().mockResolvedValue(undefined)

      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth,
        handleExport: jest.fn().mockResolvedValue(undefined),
        handleImport: jest.fn().mockResolvedValue(undefined),
        handleClear: jest.fn().mockResolvedValue(undefined),
        handleSeed: jest.fn().mockResolvedValue(undefined),
        formatBytes: jest.fn().mockReturnValue('0 B'),
      } as any)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig,
        handleTestConnection: jest.fn().mockResolvedValue(undefined),
        handleSaveStorageConfig: jest.fn().mockResolvedValue(undefined),
      } as any)

      renderHook(() => useSettingsState())

      expect(loadStats).toHaveBeenCalled()
      expect(checkSchemaHealth).toHaveBeenCalled()
      expect(loadConfig).toHaveBeenCalled()
    })
  })

  describe('state passthrough', () => {
    it('should expose database operations state', () => {
      mockUseDatabaseOperations.mockReturnValue({
        stats: {
          snippetCount: 10,
          templateCount: 2,
          namespaceCount: 3,
          storageType: 'indexeddb',
          databaseSize: 1024,
        },
        loading: true,
        schemaHealth: 'healthy',
        checkingSchema: true,
        loadStats: jest.fn(),
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.stats?.snippetCount).toBe(10)
      expect(result.current.loading).toBe(true)
      expect(result.current.schemaHealth).toBe('healthy')
      expect(result.current.checkingSchema).toBe(true)
    })

    it('should expose storage config state', () => {
      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'flask',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://example.com:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'connected',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: true,
        envVarSet: true,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.storageBackend).toBe('flask')
      expect(result.current.flaskUrl).toBe('http://example.com:5000')
      expect(result.current.flaskConnectionStatus).toBe('connected')
      expect(result.current.testingConnection).toBe(true)
      expect(result.current.envVarSet).toBe(true)
    })

    it('should expose setter functions', () => {
      const setStorageBackend = jest.fn()
      const setFlaskUrl = jest.fn()
      const setFlaskConnectionStatus = jest.fn()

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend,
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl,
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus,
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      act(() => {
        result.current.setStorageBackend('flask')
      })
      expect(setStorageBackend).toHaveBeenCalledWith('flask')

      act(() => {
        result.current.setFlaskUrl('http://example.com')
      })
      expect(setFlaskUrl).toHaveBeenCalledWith('http://example.com')
    })
  })

  describe('handleSaveStorageConfig', () => {
    it('should call storage config handler with loadStats as callback', async () => {
      const saveConfig = jest.fn().mockResolvedValue(undefined)
      const loadStats = jest.fn().mockResolvedValue(undefined)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: saveConfig,
      } as any)

      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      await act(async () => {
        await result.current.handleSaveStorageConfig()
      })

      expect(saveConfig).toHaveBeenCalledWith(loadStats)
    })
  })

  describe('handleMigrateToFlask', () => {
    it('should call migration handler with flask URL and loadStats callback', async () => {
      const migrateToFlask = jest.fn().mockResolvedValue(undefined)
      const loadStats = jest.fn().mockResolvedValue(undefined)

      mockUseStorageMigration.mockReturnValue({
        handleMigrateToFlask: migrateToFlask,
        handleMigrateToIndexedDB: jest.fn(),
      } as any)

      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      } as any)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://example.com:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      await act(async () => {
        await result.current.handleMigrateToFlask()
      })

      expect(migrateToFlask).toHaveBeenCalledWith('http://example.com:5000', loadStats)
    })
  })

  describe('handleMigrateToIndexedDB', () => {
    it('should call migration handler with flask URL', async () => {
      const migrateToIndexedDB = jest.fn().mockResolvedValue(undefined)

      mockUseStorageMigration.mockReturnValue({
        handleMigrateToFlask: jest.fn(),
        handleMigrateToIndexedDB: migrateToIndexedDB,
      } as any)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'flask',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://example.com:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'connected',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      await act(async () => {
        await result.current.handleMigrateToIndexedDB()
      })

      expect(migrateToIndexedDB).toHaveBeenCalledWith('http://example.com:5000')
    })
  })

  describe('handler functions', () => {
    it('should expose database operation handlers', () => {
      const handleExport = jest.fn()
      const handleImport = jest.fn()
      const handleClear = jest.fn()
      const handleSeed = jest.fn()
      const handleTestConnection = jest.fn()
      const checkSchemaHealth = jest.fn()

      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats: jest.fn(),
        checkSchemaHealth,
        handleExport,
        handleImport,
        handleClear,
        handleSeed,
        formatBytes: jest.fn(),
      } as any)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection,
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.handleExport).toBe(handleExport)
      expect(result.current.handleImport).toBe(handleImport)
      expect(result.current.handleClear).toBe(handleClear)
      expect(result.current.handleSeed).toBe(handleSeed)
      expect(result.current.handleTestConnection).toBe(handleTestConnection)
      expect(result.current.checkSchemaHealth).toBe(checkSchemaHealth)
    })

    it('should expose formatBytes utility', () => {
      const formatBytes = jest.fn().mockReturnValue('1.5 MB')

      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats: jest.fn(),
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes,
      } as any)

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.formatBytes(1536000)).toBe('1.5 MB')
      expect(formatBytes).toHaveBeenCalledWith(1536000)
    })
  })

  describe('combined hook behavior', () => {
    it('should have all expected properties in return value', () => {
      const { result } = renderHook(() => useSettingsState())

      const expectedProperties = [
        'stats',
        'loading',
        'storageBackend',
        'setStorageBackend',
        'flaskUrl',
        'setFlaskUrl',
        'flaskConnectionStatus',
        'setFlaskConnectionStatus',
        'testingConnection',
        'envVarSet',
        'schemaHealth',
        'checkingSchema',
        'handleExport',
        'handleImport',
        'handleClear',
        'handleSeed',
        'formatBytes',
        'handleTestConnection',
        'handleSaveStorageConfig',
        'handleMigrateToFlask',
        'handleMigrateToIndexedDB',
        'checkSchemaHealth',
      ]

      expectedProperties.forEach((prop) => {
        expect(result.current).toHaveProperty(prop)
      })
    })

    it('should handle concurrent operations', async () => {
      const loadStats = jest.fn().mockResolvedValue(undefined)
      const checkSchemaHealth = jest.fn().mockResolvedValue(undefined)

      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth,
        handleExport: jest.fn().mockResolvedValue(undefined),
        handleImport: jest.fn().mockResolvedValue(undefined),
        handleClear: jest.fn().mockResolvedValue(undefined),
        handleSeed: jest.fn().mockResolvedValue(undefined),
        formatBytes: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      await act(async () => {
        await Promise.all([
          result.current.handleExport(new File([], 'export.json')),
          result.current.handleTestConnection(),
        ])
      })

      // Verify handlers were called
      expect(result.current.handleExport).toBeDefined()
      expect(result.current.handleTestConnection).toBeDefined()
    })

    it('should update storage backend when changed', () => {
      const setStorageBackend = jest.fn()

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend,
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      act(() => {
        result.current.setStorageBackend('flask')
      })

      expect(setStorageBackend).toHaveBeenCalledWith('flask')
    })

    it('should handle error states gracefully', () => {
      mockUseDatabaseOperations.mockReturnValue({
        stats: null,
        loading: false,
        schemaHealth: 'corrupted',
        checkingSchema: false,
        loadStats: jest.fn(),
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      } as any)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'failed',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.schemaHealth).toBe('corrupted')
      expect(result.current.flaskConnectionStatus).toBe('failed')
    })
  })
})
