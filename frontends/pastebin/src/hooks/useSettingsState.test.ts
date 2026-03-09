import { renderHook, act } from '@testing-library/react'
import { useSettingsState } from './useSettingsState'
import * as hookModule from './useDatabaseOperations'
import * as storageConfigModule from './useStorageConfig'
import * as storageMigrationModule from './useStorageMigration'

// Mock the dependent hooks
jest.mock('./useDatabaseOperations')
jest.mock('./useStorageConfig')
jest.mock('./useStorageMigration')

const mockUseDatabaseOperations = hookModule.useDatabaseOperations as jest.Mock
const mockUseStorageConfig = storageConfigModule.useStorageConfig as jest.Mock
const mockUseStorageMigration = storageMigrationModule.useStorageMigration as jest.Mock

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
      envVarSet: false,
      loadConfig: jest.fn().mockResolvedValue(undefined),
      handleSaveStorageConfig: jest.fn().mockResolvedValue(undefined),
    } as any)

    mockUseStorageMigration.mockReturnValue({} as any)
  })

  describe('initialization', () => {
    it('should initialize with combined state from all hooks', () => {
      const { result } = renderHook(() => useSettingsState())

      expect(result.current.storageBackend).toBe('indexeddb')
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
        envVarSet: false,
        loadConfig,
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
        storageBackend: 'dbal',
        setStorageBackend: jest.fn(),
        envVarSet: true,
        loadConfig: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.storageBackend).toBe('dbal')
      expect(result.current.envVarSet).toBe(true)
    })

    it('should expose setter functions', () => {
      const setStorageBackend = jest.fn()

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      act(() => {
        result.current.setStorageBackend('dbal')
      })
      expect(setStorageBackend).toHaveBeenCalledWith('dbal')
    })
  })

  describe('handleSaveStorageConfig', () => {
    it('should call storage config handler with loadStats as callback', async () => {
      const saveConfig = jest.fn().mockResolvedValue(undefined)
      const loadStats = jest.fn().mockResolvedValue(undefined)

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        envVarSet: false,
        loadConfig: jest.fn(),
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

  describe('handler functions', () => {
    it('should expose database operation handlers', () => {
      const handleExport = jest.fn()
      const handleImport = jest.fn()
      const handleClear = jest.fn()
      const handleSeed = jest.fn()
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

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.handleExport).toBe(handleExport)
      expect(result.current.handleImport).toBe(handleImport)
      expect(result.current.handleClear).toBe(handleClear)
      expect(result.current.handleSeed).toBe(handleSeed)
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
        'envVarSet',
        'schemaHealth',
        'checkingSchema',
        'handleExport',
        'handleImport',
        'handleClear',
        'handleSeed',
        'formatBytes',
        'handleSaveStorageConfig',
        'checkSchemaHealth',
      ]

      expectedProperties.forEach((prop) => {
        expect(result.current).toHaveProperty(prop)
      })
    })

    it('should update storage backend when changed', () => {
      const setStorageBackend = jest.fn()

      mockUseStorageConfig.mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      } as any)

      const { result } = renderHook(() => useSettingsState())

      act(() => {
        result.current.setStorageBackend('dbal')
      })

      expect(setStorageBackend).toHaveBeenCalledWith('dbal')
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

      const { result } = renderHook(() => useSettingsState())

      expect(result.current.schemaHealth).toBe('corrupted')
    })
  })
})
