/**
 * Unit Tests for useStorageMigration Hook
 * Tests data migration between IndexedDB and Flask backends
 */

import { renderHook, act } from '@testing-library/react';
import { useStorageMigration } from '@/hooks/useStorageMigration';
import * as db from '@/lib/db';
import * as storage from '@/lib/storage';
import { toast } from 'sonner';
import type { Snippet } from '@/lib/types';

jest.mock('@/lib/db');
jest.mock('@/lib/storage');
jest.mock('sonner');

describe('useStorageMigration Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleMigrateToFlask', () => {
    it('should migrate snippets to Flask backend', async () => {
      const snippets: Snippet[] = [
        {
          id: '1',
          title: 'Test',
          description: '',
          language: 'javascript',
          code: 'console.log("test")',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        },
      ];

      (db.getAllSnippets as jest.Mock).mockResolvedValue(snippets);

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
        migrateFromIndexedDB: jest.fn().mockResolvedValue(undefined),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);
      (storage.saveStorageConfig as jest.Mock).mockImplementation();

      const { result } = renderHook(() => useStorageMigration());

      const onSuccess = jest.fn().mockResolvedValue(undefined);

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000', onSuccess);
      });

      expect(mockAdapter.testConnection).toHaveBeenCalled();
      expect(mockAdapter.migrateFromIndexedDB).toHaveBeenCalledWith(snippets);
      expect(storage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'flask',
        flaskUrl: 'http://localhost:5000',
      });
      expect(toast.success).toHaveBeenCalledWith(
        'Successfully migrated 1 snippets to Flask backend'
      );
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should handle empty Flask URL', async () => {
      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToFlask('');
      });

      expect(toast.error).toHaveBeenCalledWith('Please enter a Flask backend URL');
      expect(db.getAllSnippets).not.toHaveBeenCalled();
    });

    it('should handle connection failure', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(false),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000');
      });

      expect(toast.error).toHaveBeenCalledWith('Cannot connect to Flask backend');
      expect(db.getAllSnippets).not.toHaveBeenCalled();
    });

    it('should handle no snippets to migrate', async () => {
      (db.getAllSnippets as jest.Mock).mockResolvedValue([]);

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000');
      });

      expect(toast.info).toHaveBeenCalledWith('No snippets to migrate');
    });

    it('should handle migration error', async () => {
      (db.getAllSnippets as jest.Mock).mockResolvedValue([
        {
          id: '1',
          title: 'Test',
          description: '',
          language: 'javascript',
          code: '',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        },
      ]);

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
        migrateFromIndexedDB: jest.fn().mockRejectedValue(new Error('Migration failed')),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to migrate data to Flask backend');
    });

    it('should not call onSuccess if migration fails', async () => {
      (db.getAllSnippets as jest.Mock).mockResolvedValue([]);

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const onSuccess = jest.fn();

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000', onSuccess);
      });

      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should handle multiple snippets migration', async () => {
      const snippets: Snippet[] = [
        {
          id: '1',
          title: 'Snippet 1',
          description: '',
          language: 'javascript',
          code: '',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        },
        {
          id: '2',
          title: 'Snippet 2',
          description: '',
          language: 'python',
          code: '',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        },
      ];

      (db.getAllSnippets as jest.Mock).mockResolvedValue(snippets);

      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
        migrateFromIndexedDB: jest.fn().mockResolvedValue(undefined),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);
      (storage.saveStorageConfig as jest.Mock).mockImplementation();

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToFlask('http://localhost:5000');
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Successfully migrated 2 snippets to Flask backend'
      );
    });
  });

  describe('handleMigrateToIndexedDB', () => {
    it('should migrate from Flask to IndexedDB', async () => {
      const snippets: Snippet[] = [
        {
          id: '1',
          title: 'Test',
          description: '',
          language: 'javascript',
          code: '',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        },
      ];

      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValue(snippets),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);
      (storage.saveStorageConfig as jest.Mock).mockImplementation();

      // Mock window.location.reload
      delete (window as any).location;
      window.location = { reload: jest.fn() } as any;

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000');
      });

      expect(storage.saveStorageConfig).toHaveBeenCalledWith({
        backend: 'indexeddb',
      });
      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should handle empty Flask URL', async () => {
      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('');
      });

      expect(toast.error).toHaveBeenCalledWith('Please enter a Flask backend URL');
    });

    it('should handle no snippets to migrate', async () => {
      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValue([]),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000');
      });

      expect(toast.info).toHaveBeenCalledWith('No snippets to migrate');
    });

    it('should handle migration error', async () => {
      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockRejectedValue(new Error('Migration failed')),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to migrate data from Flask backend');
    });

    it('should handle adapter creation error', async () => {
      (storage.FlaskStorageAdapter as any) = jest.fn(() => {
        throw new Error('Invalid URL');
      });

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('invalid-url');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to migrate data from Flask backend');
    });

    it('should not reload if no snippets', async () => {
      const mockAdapter = {
        migrateToIndexedDB: jest.fn().mockResolvedValue([]),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);

      delete (window as any).location;
      window.location = { reload: jest.fn() } as any;

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await result.current.handleMigrateToIndexedDB('http://localhost:5000');
      });

      expect(window.location.reload).not.toHaveBeenCalled();
    });
  });

  describe('complex scenarios', () => {
    it('should handle rapid migration calls', async () => {
      const mockAdapter = {
        testConnection: jest.fn().mockResolvedValue(true),
        migrateFromIndexedDB: jest.fn().mockResolvedValue(undefined),
      };
      (storage.FlaskStorageAdapter as any) = jest.fn(() => mockAdapter);
      (storage.saveStorageConfig as jest.Mock).mockImplementation();
      (db.getAllSnippets as jest.Mock).mockResolvedValue([]);

      const { result } = renderHook(() => useStorageMigration());

      await act(async () => {
        await Promise.all([
          result.current.handleMigrateToFlask('http://localhost:5000'),
          result.current.handleMigrateToFlask('http://localhost:5000'),
        ]);
      });

      expect(mockAdapter.testConnection).toHaveBeenCalledTimes(2);
    });
  });
});
