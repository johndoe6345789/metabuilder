/**
 * Unit Tests for useDatabaseOperations Hook
 * Tests database stats, export/import, and maintenance operations
 */

import { renderHook, act } from '@testing-library/react';
import { useDatabaseOperations } from '@/hooks/useDatabaseOperations';
import * as db from '@/lib/db';
import { toast } from 'sonner';

jest.mock('@/lib/db');
jest.mock('sonner');

describe('useDatabaseOperations Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.URL.createObjectURL as any) = jest.fn(() => 'blob:mock');
    (global.URL.revokeObjectURL as any) = jest.fn();
  });

  describe('loadStats', () => {
    it('should load database stats', async () => {
      (db.getDatabaseStats as jest.Mock).mockResolvedValue({
        snippetCount: 5,
        templateCount: 2,
        namespaceCount: 3,
        storageType: 'indexeddb',
        databaseSize: 1024,
      });

      const { result } = renderHook(() => useDatabaseOperations());

      expect(result.current.loading).toBe(true);

      await act(async () => {
        await result.current.loadStats();
      });

      expect(result.current.stats?.snippetCount).toBe(5);
      expect(result.current.stats?.templateCount).toBe(2);
      expect(result.current.loading).toBe(false);
    });

    it('should handle stats loading error', async () => {
      (db.getDatabaseStats as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.loadStats();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to load database statistics');
      expect(result.current.loading).toBe(false);
    });
  });

  describe('checkSchemaHealth', () => {
    it('should check schema and return healthy', async () => {
      (db.validateDatabaseSchema as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useDatabaseOperations());

      expect(result.current.schemaHealth).toBe('unknown');

      await act(async () => {
        await result.current.checkSchemaHealth();
      });

      expect(result.current.schemaHealth).toBe('healthy');
      expect(result.current.checkingSchema).toBe(false);
    });

    it('should check schema and return corrupted', async () => {
      (db.validateDatabaseSchema as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.checkSchemaHealth();
      });

      expect(result.current.schemaHealth).toBe('corrupted');
    });

    it('should handle schema check error', async () => {
      (db.validateDatabaseSchema as jest.Mock).mockRejectedValue(new Error('Check failed'));

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.checkSchemaHealth();
      });

      expect(result.current.schemaHealth).toBe('corrupted');
    });
  });

  describe('handleExport', () => {
    it('should export database successfully', async () => {
      const mockData = JSON.stringify({ snippets: [], namespaces: [] });
      (db.exportDatabase as jest.Mock).mockResolvedValue(mockData);

      const { result } = renderHook(() => useDatabaseOperations());

      // Mock DOM methods
      const mockLink = document.createElement('a');
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      jest.spyOn(document.body, 'appendChild').mockImplementation();
      jest.spyOn(document.body, 'removeChild').mockImplementation();
      jest.spyOn(mockLink, 'click').mockImplementation();

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.success).toHaveBeenCalledWith('Database exported successfully');
    });

    it('should handle export error', async () => {
      (db.exportDatabase as jest.Mock).mockRejectedValue(new Error('Export failed'));

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.handleExport();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to export database');
    });
  });

  describe('handleImport', () => {
    it('should import database successfully', async () => {
      (db.importDatabase as jest.Mock).mockResolvedValue(undefined);
      (db.getDatabaseStats as jest.Mock).mockResolvedValue({
        snippetCount: 10,
        templateCount: 5,
        namespaceCount: 2,
        storageType: 'indexeddb',
        databaseSize: 2048,
      });

      const { result } = renderHook(() => useDatabaseOperations());

      const mockFile = new File(['{"snippets": [], "namespaces": []}'], 'test.json');
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'test',
        },
      } as any;

      jest.spyOn(mockFile, 'text').mockResolvedValue('{"snippets": [], "namespaces": []}');

      await act(async () => {
        await result.current.handleImport(mockEvent);
      });

      expect(toast.success).toHaveBeenCalledWith('Database imported successfully');
    });

    it('should handle import error', async () => {
      (db.importDatabase as jest.Mock).mockRejectedValue(new Error('Import failed'));

      const { result } = renderHook(() => useDatabaseOperations());

      const mockFile = new File(['{"snippets": [], "namespaces": []}'], 'test.json');
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'test',
        },
      } as any;

      jest.spyOn(mockFile, 'text').mockResolvedValue('{"snippets": [], "namespaces": []}');

      await act(async () => {
        await result.current.handleImport(mockEvent);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to import database');
    });

    it('should handle missing file', async () => {
      const { result } = renderHook(() => useDatabaseOperations());

      const mockEvent = {
        target: {
          files: null,
          value: 'test',
        },
      } as any;

      await act(async () => {
        await result.current.handleImport(mockEvent);
      });

      expect(toast.success).not.toHaveBeenCalled();
    });

    it('should clear file input after import', async () => {
      (db.importDatabase as jest.Mock).mockResolvedValue(undefined);
      (db.getDatabaseStats as jest.Mock).mockResolvedValue({
        snippetCount: 0,
        templateCount: 0,
        namespaceCount: 0,
        storageType: 'indexeddb',
        databaseSize: 0,
      });

      const { result } = renderHook(() => useDatabaseOperations());

      const mockFile = new File(['{}'], 'test.json');
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'test',
        },
      } as any;

      jest.spyOn(mockFile, 'text').mockResolvedValue('{}');

      await act(async () => {
        await result.current.handleImport(mockEvent);
      });

      expect(mockEvent.target.value).toBe('');
    });
  });

  describe('handleClear', () => {
    it('should clear database with user confirmation', async () => {
      (db.clearDatabase as jest.Mock).mockResolvedValue(undefined);
      (db.getDatabaseStats as jest.Mock).mockResolvedValue({
        snippetCount: 0,
        templateCount: 0,
        namespaceCount: 0,
        storageType: 'indexeddb',
        databaseSize: 0,
      });
      (db.validateDatabaseSchema as jest.Mock).mockResolvedValue(true);

      jest.spyOn(window, 'confirm').mockReturnValue(true);

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.handleClear();
      });

      expect(toast.success).toHaveBeenCalled();
    });

    it('should not clear database without confirmation', async () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.handleClear();
      });

      expect(db.clearDatabase).not.toHaveBeenCalled();
    });

    it('should handle clear error', async () => {
      (db.clearDatabase as jest.Mock).mockRejectedValue(new Error('Clear failed'));
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.handleClear();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to clear database');
    });
  });

  describe('handleSeed', () => {
    it('should seed database successfully', async () => {
      (db.seedDatabase as jest.Mock).mockResolvedValue(undefined);
      (db.getDatabaseStats as jest.Mock).mockResolvedValue({
        snippetCount: 10,
        templateCount: 5,
        namespaceCount: 3,
        storageType: 'indexeddb',
        databaseSize: 2048,
      });

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.handleSeed();
      });

      expect(toast.success).toHaveBeenCalledWith('Sample data added successfully');
    });

    it('should handle seed error', async () => {
      (db.seedDatabase as jest.Mock).mockRejectedValue(new Error('Seed failed'));

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.handleSeed();
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to add sample data');
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      const { result } = renderHook(() => useDatabaseOperations());
      expect(result.current.formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes', () => {
      const { result } = renderHook(() => useDatabaseOperations());
      expect(result.current.formatBytes(1024)).toContain('KB');
    });

    it('should format kilobytes', () => {
      const { result } = renderHook(() => useDatabaseOperations());
      expect(result.current.formatBytes(1024 * 1024)).toContain('MB');
    });

    it('should format megabytes', () => {
      const { result } = renderHook(() => useDatabaseOperations());
      expect(result.current.formatBytes(1024 * 1024 * 1024)).toContain('GB');
    });

    it('should round to 2 decimal places', () => {
      const { result } = renderHook(() => useDatabaseOperations());
      const formatted = result.current.formatBytes(1536);
      expect(formatted).toMatch(/1\.5\d? KB/);
    });
  });

  describe('initial state', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useDatabaseOperations());

      expect(result.current.loading).toBe(true);
      expect(result.current.stats).toBeNull();
      expect(result.current.schemaHealth).toBe('unknown');
      expect(result.current.checkingSchema).toBe(false);
    });
  });

  describe('complex scenarios', () => {
    it('should handle load then clear workflow', async () => {
      (db.getDatabaseStats as jest.Mock).mockResolvedValue({
        snippetCount: 10,
        templateCount: 5,
        namespaceCount: 2,
        storageType: 'indexeddb',
        databaseSize: 2048,
      });
      (db.clearDatabase as jest.Mock).mockResolvedValue(undefined);
      (db.validateDatabaseSchema as jest.Mock).mockResolvedValue(true);

      jest.spyOn(window, 'confirm').mockReturnValue(true);

      const { result } = renderHook(() => useDatabaseOperations());

      await act(async () => {
        await result.current.loadStats();
      });

      expect(result.current.stats?.snippetCount).toBe(10);

      await act(async () => {
        await result.current.handleClear();
      });

      expect(toast.success).toHaveBeenCalled();
    });
  });
});
