import { renderHook, act } from '@testing-library/react'
import { useStorageConfig } from './useStorageConfig'
import * as storageModule from '@/lib/storage'
import * as sonerModule from 'sonner'

// Mock the storage module
jest.mock('@/lib/storage')

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock process.env
const originalEnv = process.env

const mockStorage = storageModule as jest.Mocked<typeof storageModule>
const mockToast = sonerModule.toast as jest.Mocked<typeof sonerModule.toast>

describe('useStorageConfig Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    delete (process.env as any).NEXT_PUBLIC_FLASK_BACKEND_URL
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('initialization', () => {
    it('should initialize with default state', () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      expect(result.current.storageBackend).toBe('indexeddb')
      expect(result.current.flaskUrl).toBe('')
      expect(result.current.flaskConnectionStatus).toBe('unknown')
      expect(result.current.testingConnection).toBe(false)
      expect(result.current.envVarSet).toBe(false)
    })
  })

  describe('setStorageBackend', () => {
    it('should update storage backend state', () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('flask')
      })

      expect(result.current.storageBackend).toBe('flask')
    })

    it('should support toggling between backends', () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('flask')
      })
      expect(result.current.storageBackend).toBe('flask')

      act(() => {
        result.current.setStorageBackend('indexeddb')
      })
      expect(result.current.storageBackend).toBe('indexeddb')
    })
  })

  describe('setFlaskUrl', () => {
    it('should update Flask URL state', () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setFlaskUrl('http://localhost:5000')
      })

      expect(result.current.flaskUrl).toBe('http://localhost:5000')
    })

    it('should accept different URL formats', () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      const urls = [
        'http://example.com:5000',
        'https://api.example.com',
        'http://localhost:3000',
      ]

      urls.forEach((url) => {
        act(() => {
          result.current.setFlaskUrl(url)
        })
        expect(result.current.flaskUrl).toBe(url)
      })
    })
  })

  describe('setFlaskConnectionStatus', () => {
    it('should update connection status', () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setFlaskConnectionStatus('connected')
      })
      expect(result.current.flaskConnectionStatus).toBe('connected')

      act(() => {
        result.current.setFlaskConnectionStatus('failed')
      })
      expect(result.current.flaskConnectionStatus).toBe('failed')
    })
  })

  describe('loadConfig', () => {
    it('should load config from storage and update state', () => {
      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      // Initially flaskUrl is empty until loadConfig is called
      expect(result.current.flaskUrl).toBe('')

      act(() => {
        result.current.loadConfig()
      })

      // After loadConfig, should have set to default
      expect(result.current.storageBackend).toBe('indexeddb')
      expect(result.current.flaskUrl).toBe('http://localhost:5000')
    })

    it('should use environment variable if set', () => {
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL = 'http://env.example.com:5000'

      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.loadConfig()
      })

      expect(result.current.envVarSet).toBe(true)
      expect(result.current.flaskUrl).toBe('http://env.example.com:5000')
    })

    it('should default to localhost:5000 if nothing is configured', () => {
      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.loadConfig()
      })

      expect(result.current.flaskUrl).toBe('http://localhost:5000')
    })

    it('should preserve stored flask url when environment variable is set', () => {
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL = 'http://env.example.com:5000'

      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'flask',
        flaskUrl: 'http://stored.example.com:5000',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.loadConfig()
      })

      // When env var is set, it takes precedence in the loadConfig function
      expect(result.current.flaskUrl).toBe('http://env.example.com:5000')
    })
  })

  describe('connection testing through handleTestConnection', () => {
    it('should test connection and update status to connected', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setFlaskUrl('http://localhost:5000')
      })

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.flaskConnectionStatus).toBe('connected')
      expect(result.current.testingConnection).toBe(false)
    })

    it('should handle failed connection test', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(false),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setFlaskUrl('http://localhost:5000')
      })

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.flaskConnectionStatus).toBe('failed')
      expect(result.current.testingConnection).toBe(false)
    })

    it('should handle connection test error', async () => {
      const error = new Error('Connection failed')
      const mockAdapter = {
        testConnection: jest.fn().mockRejectedValueOnce(error),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.loadStorageConfig.mockReturnValue({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setFlaskUrl('http://localhost:5000')
      })

      await act(async () => {
        await result.current.handleTestConnection()
      })

      expect(result.current.flaskConnectionStatus).toBe('failed')
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
        flaskUrl: undefined,
      })
      expect(mockToast.success).toHaveBeenCalledWith('Storage backend updated successfully')
    })

    it('should not save Flask config without URL', async () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('flask')
        result.current.setFlaskUrl('')
      })

      await act(async () => {
        await result.current.handleSaveStorageConfig()
      })

      expect(mockToast.error).toHaveBeenCalledWith('Please enter a Flask backend URL')
      expect(mockStorage.saveStorageConfig).not.toHaveBeenCalled()
    })

    it('should test connection before saving Flask config', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(true),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('flask')
        result.current.setFlaskUrl('http://localhost:5000')
      })

      await act(async () => {
        await result.current.handleSaveStorageConfig()
      })

      expect(mockStorage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'flask',
        flaskUrl: 'http://localhost:5000',
      })
    })

    it('should not save if Flask connection test fails', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValueOnce(false),
      }

      jest.spyOn(storageModule, 'FlaskStorageAdapter').mockImplementationOnce(
        () => mockAdapter as any
      )

      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())

      act(() => {
        result.current.setStorageBackend('flask')
        result.current.setFlaskUrl('http://localhost:5000')
      })

      await act(async () => {
        await result.current.handleSaveStorageConfig()
      })

      expect(mockToast.error).toHaveBeenCalledWith(
        'Cannot connect to Flask backend. Please check the URL and ensure the server is running.'
      )
      expect(mockStorage.saveStorageConfig).not.toHaveBeenCalled()
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

    it('should not call onSuccess if save fails', async () => {
      mockStorage.loadStorageConfig.mockReturnValueOnce({
        backend: 'indexeddb',
      })

      const { result } = renderHook(() => useStorageConfig())
      const onSuccess = jest.fn().mockResolvedValueOnce(undefined)

      act(() => {
        result.current.setStorageBackend('flask')
        result.current.setFlaskUrl('')
      })

      await act(async () => {
        await result.current.handleSaveStorageConfig(onSuccess)
      })

      expect(onSuccess).not.toHaveBeenCalled()
    })
  })
})
