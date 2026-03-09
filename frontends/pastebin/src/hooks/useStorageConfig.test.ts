import { renderHook, act } from '@testing-library/react'
import { useStorageConfig } from './useStorageConfig'
import * as storageModule from '@/lib/storage'

// Mock the storage module
jest.mock('@/lib/storage')

// Mock fakemui toast
jest.mock('@metabuilder/components/fakemui', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock useTranslation
jest.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    settings: { storage: { backendUpdated: 'Storage backend updated successfully' } },
  }),
}))

import { toast } from '@metabuilder/components/fakemui'

// Mock process.env
const originalEnv = process.env

const mockStorage = storageModule as jest.Mocked<typeof storageModule>
const mockToast = toast as jest.Mocked<typeof toast>

describe('useStorageConfig Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete (process.env as any).NEXT_PUBLIC_DBAL_API_URL
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useStorageConfig())

      expect(result.current.storageBackend).toBe('indexeddb')
      expect(result.current.envVarSet).toBe(false)
    })
  })

  describe('setStorageBackend', () => {
    it('should update storage backend state', () => {
      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('dbal')
      })

      expect(result.current.storageBackend).toBe('dbal')
    })

    it('should support toggling between backends', () => {
      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('dbal')
      })
      expect(result.current.storageBackend).toBe('dbal')

      act(() => {
        result.current.setStorageBackend('indexeddb')
      })
      expect(result.current.storageBackend).toBe('indexeddb')
    })
  })

  describe('loadConfig', () => {
    it('should load config from storage and update state', () => {
      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'dbal',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.loadConfig()
      })

      expect(result.current.storageBackend).toBe('dbal')
    })

    it('should use environment variable to set envVarSet', () => {
      process.env.NEXT_PUBLIC_DBAL_API_URL = 'http://env.example.com:5000'

      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.loadConfig()
      })

      expect(result.current.envVarSet).toBe(true)
    })

    it('should default envVarSet to false if no env var', () => {
      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.loadConfig()
      })

      expect(result.current.envVarSet).toBe(false)
    })
  })

  describe('handleSaveStorageConfig', () => {
    it('should save indexeddb config without connection test', async () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('indexeddb')
      })

      await act(async () => {
        await result.current.handleSaveStorageConfig()
      })

      expect(mockStorage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'indexeddb',
      })
      expect(mockToast.success).toHaveBeenCalledWith('Storage backend updated successfully')
    })

    it('should call onSuccess callback after saving', async () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())
      const onSuccess = jest.fn().mockResolvedValueOnce(undefined)

      act(() => {
        result.current.setStorageBackend('indexeddb')
      })

      await act(async () => {
        await result.current.handleSaveStorageConfig(onSuccess)
      })

      expect(onSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
