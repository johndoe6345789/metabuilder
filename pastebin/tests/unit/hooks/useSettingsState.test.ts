/**
 * Unit Tests for useSettingsState Hook
 * Tests composite settings state management combining database, storage config, and migration
 */

import { renderHook, act } from '@testing-library/react';
import { useSettingsState } from '@/hooks/useSettingsState';

// Mock all sub-hooks
jest.mock('@/hooks/useDatabaseOperations');
jest.mock('@/hooks/useStorageConfig');
jest.mock('@/hooks/useStorageMigration');

import * as useDatabaseOpsHook from '@/hooks/useDatabaseOperations';
import * as useStorageConfigHook from '@/hooks/useStorageConfig';
import * as useStorageMigrationHook from '@/hooks/useStorageMigration';

describe('useSettingsState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
      stats: null,
      loading: true,
      schemaHealth: 'unknown',
      checkingSchema: false,
      loadStats: jest.fn(),
      checkSchemaHealth: jest.fn(),
      handleExport: jest.fn(),
      handleImport: jest.fn(),
      handleClear: jest.fn(),
      handleSeed: jest.fn(),
      formatBytes: jest.fn(),
    });

    (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
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
      handleSaveStorageConfig: jest.fn(),
    });

    (useStorageMigrationHook.useStorageMigration as jest.Mock).mockReturnValue({
      handleMigrateToFlask: jest.fn(),
      handleMigrateToIndexedDB: jest.fn(),
    });
  });

  describe('returned properties', () => {
    it('should return database stats properties', () => {
      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: {
          snippetCount: 10,
          templateCount: 5,
          namespaceCount: 2,
          storageType: 'indexeddb',
          databaseSize: 2048,
        },
        loading: false,
        schemaHealth: 'healthy',
        checkingSchema: false,
        loadStats: jest.fn(),
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      });

      const { result } = renderHook(() => useSettingsState());

      expect(result.current.stats).toBeTruthy();
      expect(result.current.loading).toBe(false);
      expect(result.current.schemaHealth).toBe('healthy');
      expect(result.current.checkingSchema).toBe(false);
    });

    it('should return storage config properties', () => {
      const { result } = renderHook(() => useSettingsState());

      expect(result.current.storageBackend).toBe('indexeddb');
      expect(result.current.flaskUrl).toBe('http://localhost:5000');
      expect(result.current.flaskConnectionStatus).toBe('unknown');
      expect(result.current.testingConnection).toBe(false);
      expect(result.current.envVarSet).toBe(false);
    });

    it('should return all handler functions', () => {
      const { result } = renderHook(() => useSettingsState());

      expect(typeof result.current.handleExport).toBe('function');
      expect(typeof result.current.handleImport).toBe('function');
      expect(typeof result.current.handleClear).toBe('function');
      expect(typeof result.current.handleSeed).toBe('function');
      expect(typeof result.current.formatBytes).toBe('function');
      expect(typeof result.current.handleTestConnection).toBe('function');
      expect(typeof result.current.handleSaveStorageConfig).toBe('function');
      expect(typeof result.current.handleMigrateToFlask).toBe('function');
      expect(typeof result.current.handleMigrateToIndexedDB).toBe('function');
      expect(typeof result.current.checkSchemaHealth).toBe('function');
    });
  });

  describe('initialization effects', () => {
    it('should call loadStats on mount', () => {
      const loadStats = jest.fn();
      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      });

      const loadConfig = jest.fn();
      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: '',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig,
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      });

      renderHook(() => useSettingsState());

      expect(loadStats).toHaveBeenCalled();
      expect(loadConfig).toHaveBeenCalled();
    });

    it('should call checkSchemaHealth on mount', () => {
      const checkSchemaHealth = jest.fn();
      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats: jest.fn(),
        checkSchemaHealth,
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      });

      renderHook(() => useSettingsState());

      expect(checkSchemaHealth).toHaveBeenCalled();
    });
  });

  describe('handleSaveStorageConfig wrapper', () => {
    it('should call saveConfig with loadStats as callback', async () => {
      const loadStats = jest.fn();
      const saveConfig = jest.fn();

      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      });

      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: '',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: saveConfig,
      });

      const { result } = renderHook(() => useSettingsState());

      await act(async () => {
        await result.current.handleSaveStorageConfig();
      });

      expect(saveConfig).toHaveBeenCalledWith(loadStats);
    });
  });

  describe('handleMigrateToFlask wrapper', () => {
    it('should call migrateToFlask with flaskUrl and loadStats callback', async () => {
      const loadStats = jest.fn();
      const migrateToFlask = jest.fn();

      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn(),
      });

      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
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
        handleSaveStorageConfig: jest.fn(),
      });

      (useStorageMigrationHook.useStorageMigration as jest.Mock).mockReturnValue({
        handleMigrateToFlask: migrateToFlask,
        handleMigrateToIndexedDB: jest.fn(),
      });

      const { result } = renderHook(() => useSettingsState());

      await act(async () => {
        await result.current.handleMigrateToFlask();
      });

      expect(migrateToFlask).toHaveBeenCalledWith('http://localhost:5000', loadStats);
    });
  });

  describe('handleMigrateToIndexedDB wrapper', () => {
    it('should call handleMigrateToIndexedDB with flaskUrl', async () => {
      const migrateToIndexedDB = jest.fn();

      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
        storageBackend: 'flask',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://api.example.com',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'connected',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      });

      (useStorageMigrationHook.useStorageMigration as jest.Mock).mockReturnValue({
        handleMigrateToFlask: jest.fn(),
        handleMigrateToIndexedDB: migrateToIndexedDB,
      });

      const { result } = renderHook(() => useSettingsState());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB();
      });

      expect(migrateToIndexedDB).toHaveBeenCalledWith('http://api.example.com');
    });
  });

  describe('state updates', () => {
    it('should update storage backend', () => {
      const setStorageBackend = jest.fn();
      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend,
        flaskUrl: '',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      });

      const { result } = renderHook(() => useSettingsState());

      act(() => {
        result.current.setStorageBackend('flask');
      });

      expect(setStorageBackend).toHaveBeenCalledWith('flask');
    });

    it('should update Flask URL', () => {
      const setFlaskUrl = jest.fn();
      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: '',
        setFlaskUrl,
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig: jest.fn(),
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      });

      const { result } = renderHook(() => useSettingsState());

      act(() => {
        result.current.setFlaskUrl('http://localhost:5000');
      });

      expect(setFlaskUrl).toHaveBeenCalledWith('http://localhost:5000');
    });
  });

  describe('format bytes wrapper', () => {
    it('should format bytes correctly', () => {
      const formatBytes = jest.fn().mockReturnValue('1 KB');
      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: null,
        loading: true,
        schemaHealth: 'unknown',
        checkingSchema: false,
        loadStats: jest.fn(),
        checkSchemaHealth: jest.fn(),
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes,
      });

      const { result } = renderHook(() => useSettingsState());

      const formatted = result.current.formatBytes(1024);

      expect(formatBytes).toHaveBeenCalledWith(1024);
      expect(formatted).toBe('1 KB');
    });
  });

  describe('complex scenarios', () => {
    it('should handle full settings workflow', async () => {
      const loadStats = jest.fn();
      const checkSchemaHealth = jest.fn();
      const loadConfig = jest.fn();

      (useDatabaseOpsHook.useDatabaseOperations as jest.Mock).mockReturnValue({
        stats: {
          snippetCount: 10,
          templateCount: 5,
          namespaceCount: 2,
          storageType: 'indexeddb',
          databaseSize: 2048,
        },
        loading: false,
        schemaHealth: 'healthy',
        checkingSchema: false,
        loadStats,
        checkSchemaHealth,
        handleExport: jest.fn(),
        handleImport: jest.fn(),
        handleClear: jest.fn(),
        handleSeed: jest.fn(),
        formatBytes: jest.fn((bytes) => `${bytes} B`),
      });

      (useStorageConfigHook.useStorageConfig as jest.Mock).mockReturnValue({
        storageBackend: 'indexeddb',
        setStorageBackend: jest.fn(),
        flaskUrl: 'http://localhost:5000',
        setFlaskUrl: jest.fn(),
        flaskConnectionStatus: 'unknown',
        setFlaskConnectionStatus: jest.fn(),
        testingConnection: false,
        envVarSet: false,
        loadConfig,
        handleTestConnection: jest.fn(),
        handleSaveStorageConfig: jest.fn(),
      });

      const { result } = renderHook(() => useSettingsState());

      // Verify initialization
      expect(result.current.stats?.snippetCount).toBe(10);
      expect(result.current.schemaHealth).toBe('healthy');

      // Format bytes
      const formatted = result.current.formatBytes(1024);
      expect(formatted).toBe('1024 B');
    });
  });
});
