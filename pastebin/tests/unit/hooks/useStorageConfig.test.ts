/**
 * Unit Tests for useStorageConfig Hook
 * Tests storage backend configuration and Flask connection management
 */

import { renderHook, act } from '@testing-library/react';
import { useStorageConfig } from '@/hooks/useStorageConfig';
import * as storage from '@/lib/storage';
import { toast } from 'sonner';

jest.mock('@/lib/storage');
jest.mock('sonner');

describe('useStorageConfig Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NEXT_PUBLIC_FLASK_BACKEND_URL;
  });

  describe('initial state', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useStorageConfig());

      expect(result.current.storageBackend).toBe('indexeddb');
      expect(result.current.flaskUrl).toBe('');
      expect(result.current.flaskConnectionStatus).toBe('unknown');
      expect(result.current.testingConnection).toBe(false);
      expect(result.current.envVarSet).toBe(false);
    });
  });

  describe('loadConfig', () => {
    it('should load configuration from storage', () => {
      (storage.loadStorageConfig as jest.Mock).mockReturnValue({
        backend: 'flask',
        flaskUrl: 'http://localhost:5000',
      });

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.loadConfig();
      });

      expect(result.current.storageBackend).toBe('flask');
      expect(result.current.flaskUrl).toBe('http://localhost:5000');
    });

    it('should detect environment variable', () => {
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL = 'http://api.example.com';
      (storage.loadStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.loadConfig();
      });

      expect(result.current.envVarSet).toBe(true);
    });

    it('should use env var as default Flask URL', () => {
      process.env.NEXT_PUBLIC_FLASK_BACKEND_URL = 'http://api.example.com';
      (storage.loadStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.loadConfig();
      });

      expect(result.current.flaskUrl).toBe('http://api.example.com');
    });

    it('should use fallback URL if no config or env var', () => {
      (storage.loadStorageConfig as jest.Mock).mockReturnValue({
        backend: 'indexeddb',
      });

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.loadConfig();
      });

      expect(result.current.flaskUrl).toBe('http://localhost:5000');
    });
  });

  describe('testFlaskConnection', () => {
    it('should test Flask connection successfully', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageConfig());

      let connected = false;
      await act(async () => {
        connected = await result.current.testFlaskConnection('http://localhost:5000');
      });

      expect(connected).toBe(true);
      expect(result.current.flaskConnectionStatus).toBe('connected');
    });

    it('should handle failed connection', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(false),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageConfig());

      let connected = false;
      await act(async () => {
        connected = await result.current.testFlaskConnection('http://localhost:5000');
      });

      expect(connected).toBe(false);
      expect(result.current.flaskConnectionStatus).toBe('failed');
    });

    it('should handle adapter creation error', async () => {
      (storage.FlaskStorageAdapter as any) = jest.fn(() => {
        throw new Error('Invalid URL');
      });

      const { result } = renderHook(() => useStorageConfig());

      let connected = false;
      await act(async () => {
        connected = await result.current.testFlaskConnection('invalid-url');
      });

      expect(connected).toBe(false);
      expect(result.current.flaskConnectionStatus).toBe('failed');
    });

    it('should set testing flag', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockImplementation(() =>
          new Promise(resolve => setTimeout(() => resolve(true), 100))
        ),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageConfig());

      const testPromise = act(async () => {
        await result.current.testFlaskConnection('http://localhost:5000');
      });

      expect(result.current.testingConnection).toBe(true);
      await testPromise;
      expect(result.current.testingConnection).toBe(false);
    });
  });

  describe('handleTestConnection', () => {
    it('should test connection using current Flask URL', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setFlaskUrl('http://test.com:5000');
      });

      await act(async () => {
        await result.current.handleTestConnection();
      });

      expect((storage.FlaskStorageAdapter as any)).toHaveBeenCalledWith('http://test.com:5000');
    });
  });

  describe('handleSaveStorageConfig', () => {
    it('should save indexeddb config without testing', async () => {
      (storage.saveStorageConfig as jest.Mock).mockImplementation();

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('indexeddb');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig();
      });

      expect(storage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'indexeddb',
        flaskUrl: undefined,
      });
      expect(toast.success).toHaveBeenCalled();
    });

    it('should test Flask connection before saving', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);
      (storage.saveStorageConfig as jest.Mock).mockImplementation();

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('flask');
        result.current.setFlaskUrl('http://localhost:5000');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig();
      });

      expect(storage.saveStorageConfig).toHaveBeenCalled();
    });

    it('should reject if Flask URL is empty', async () => {
      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('flask');
        result.current.setFlaskUrl('');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig();
      });

      expect(toast.error).toHaveBeenCalledWith('Please enter a Flask backend URL');
      expect(storage.saveStorageConfig).not.toHaveBeenCalled();
    });

    it('should reject if Flask connection fails', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(false),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('flask');
        result.current.setFlaskUrl('http://localhost:5000');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig();
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Cannot connect to Flask backend. Please check the URL and ensure the server is running.'
      );
      expect(storage.saveStorageConfig).not.toHaveBeenCalled();
    });

    it('should call onSuccess callback if provided', async () => {
      (storage.saveStorageConfig as jest.Mock).mockImplementation();
      const onSuccess = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('indexeddb');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig(onSuccess);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('should not call onSuccess if save fails', async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('flask');
        result.current.setFlaskUrl('');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig(onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  describe('state setters', () => {
    it('should update storage backend', () => {
      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('flask');
      });

      expect(result.current.storageBackend).toBe('flask');
    });

    it('should update Flask URL', () => {
      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setFlaskUrl('http://api.example.com:5000');
      });

      expect(result.current.flaskUrl).toBe('http://api.example.com:5000');
    });

    it('should update connection status', () => {
      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setFlaskConnectionStatus('connected');
      });

      expect(result.current.flaskConnectionStatus).toBe('connected');
    });
  });

  describe('complex scenarios', () => {
    it('should handle full save workflow', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);
      (storage.saveStorageConfig as jest.Mock).mockImplementation();

      const onSuccess = jest.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.loadConfig();
        result.current.setStorageBackend('flask');
        result.current.setFlaskUrl('http://localhost:5000');
      });

      await act(async () => {
        await result.current.handleSaveStorageConfig(onSuccess);
      });

      expect(storage.saveStorageConfig).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('should handle backend switching', () => {
      const { result } = renderHook(() => useStorageConfig());

      act(() => {
        result.current.setStorageBackend('indexeddb');
      });

      expect(result.current.storageBackend).toBe('indexeddb');

      act(() => {
        result.current.setStorageBackend('flask');
      });

      expect(result.current.storageBackend).toBe('flask');
    });
  });
});
