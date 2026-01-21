/**
 * Unit Tests for IndexedDB Storage
 * Tests IndexedDB wrapper functions for snippets and namespaces
 */

import type { Snippet, Namespace } from '@/lib/types';
import * as idbStorage from '@/lib/indexeddb-storage';

// Mock IndexedDB
class MockIDBDatabase {
  objectStoreNames = { contains: jest.fn(() => false) };
  createObjectStore = jest.fn(() => ({
    createIndex: jest.fn(),
  }));
  transaction = jest.fn();
  close = jest.fn();
}

class MockIDBObjectStore {
  add = jest.fn();
  put = jest.fn();
  get = jest.fn();
  getAll = jest.fn();
  delete = jest.fn();
  clear = jest.fn();
  index = jest.fn();
}

class MockIDBTransaction {
  onerror: ((event: Event) => void) | null = null;
  onsuccess: ((event: Event) => void) | null = null;
  oncomplete: ((event: Event) => void) | null = null;
  objectStore = jest.fn();
  error: Error | null = null;
}

class MockIDBRequest {
  onerror: ((event: Event) => void) | null = null;
  onsuccess: ((event: Event) => void) | null = null;
  onupgradeneeded: ((event: IDBVersionChangeEvent) => void) | null = null;
  result: any = null;
  error: Error | null = null;
}

describe('IndexedDB Storage', () => {
  let mockDB: MockIDBDatabase;
  let mockRequest: MockIDBRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDB = new MockIDBDatabase();
    mockRequest = new MockIDBRequest();

    // Mock indexedDB
    global.indexedDB = {
      open: jest.fn((dbName, version) => {
        mockRequest.result = mockDB;
        setTimeout(() => {
          if (mockRequest.onsuccess) {
            mockRequest.onsuccess(new Event('success'));
          }
        }, 0);
        return mockRequest as any;
      }),
    } as any;
  });

  describe('openDB', () => {
    it('should open database connection', async () => {
      const db = await idbStorage.openDB();
      expect(db).toBeTruthy();
    });

    it('should reuse existing connection', async () => {
      const db1 = await idbStorage.openDB();
      const db2 = await idbStorage.openDB();
      expect(db1).toBe(db2);
    });

    it('should handle database open error', async () => {
      mockRequest.error = new Error('Database error');
      mockRequest.onerror = jest.fn();

      const promise = idbStorage.openDB();
      await new Promise(resolve => setTimeout(resolve, 10));

      if (mockRequest.onerror) {
        mockRequest.onerror(new Event('error'));
      }

      await expect(promise).rejects.toThrow();
    });

    it('should create snippets store on upgrade', async () => {
      mockDB.objectStoreNames.contains = jest.fn(name => false);

      const promise = idbStorage.openDB();
      await new Promise(resolve => setTimeout(resolve, 10));

      if (mockRequest.onupgradeneeded) {
        mockRequest.onupgradeneeded(
          new Event('upgradeneeded') as any
        );
      }

      if (mockRequest.onsuccess) {
        mockRequest.onsuccess(new Event('success'));
      }

      await promise;
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('snippets', { keyPath: 'id' });
    });

    it('should create namespaces store on upgrade', async () => {
      mockDB.objectStoreNames.contains = jest.fn(name => false);

      const promise = idbStorage.openDB();
      await new Promise(resolve => setTimeout(resolve, 10));

      if (mockRequest.onupgradeneeded) {
        mockRequest.onupgradeneeded(
          new Event('upgradeneeded') as any
        );
      }

      if (mockRequest.onsuccess) {
        mockRequest.onsuccess(new Event('success'));
      }

      await promise;
      expect(mockDB.createObjectStore).toHaveBeenCalledWith('namespaces', { keyPath: 'id' });
    });

    it('should skip store creation if already exists', async () => {
      mockDB.objectStoreNames.contains = jest.fn(name => true);
      const createObjectStoreSpy = jest.spyOn(mockDB, 'createObjectStore');

      const promise = idbStorage.openDB();
      await new Promise(resolve => setTimeout(resolve, 10));

      if (mockRequest.onupgradeneeded) {
        mockRequest.onupgradeneeded(
          new Event('upgradeneeded') as any
        );
      }

      if (mockRequest.onsuccess) {
        mockRequest.onsuccess(new Event('success'));
      }

      await promise;
      expect(createObjectStoreSpy).not.toHaveBeenCalled();
    });
  });

  describe('Snippet operations', () => {
    let mockTransaction: MockIDBTransaction;
    let mockObjectStore: MockIDBObjectStore;
    let mockIndexRequest: MockIDBRequest;

    beforeEach(() => {
      mockTransaction = new MockIDBTransaction();
      mockObjectStore = new MockIDBObjectStore();
      mockIndexRequest = new MockIDBRequest();

      mockDB.transaction = jest.fn(() => mockTransaction);
      mockTransaction.objectStore = jest.fn(() => mockObjectStore);
      mockObjectStore.index = jest.fn(() => mockObjectStore);
    });

    describe('getAllSnippets', () => {
      it('should retrieve all snippets', async () => {
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

        mockObjectStore.getAll = jest.fn(() => ({
          onerror: null,
          onsuccess: null,
          result: snippets,
        })) as any;

        const promise = idbStorage.getAllSnippets();
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.getAll() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual(snippets);
      });

      it('should return empty array when no snippets', async () => {
        mockObjectStore.getAll = jest.fn(() => ({
          result: [],
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getAllSnippets();
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.getAll() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual([]);
      });

      it('should handle read errors', async () => {
        mockObjectStore.getAll = jest.fn(() => ({
          onerror: null,
          onsuccess: null,
          error: new Error('Read error'),
        })) as any;

        const promise = idbStorage.getAllSnippets();
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.getAll() as any;
        if (request.onerror) {
          request.onerror(new Event('error'));
        }

        await expect(promise).rejects.toThrow();
      });
    });

    describe('getSnippet', () => {
      it('should retrieve snippet by id', async () => {
        const snippet: Snippet = {
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
        };

        mockObjectStore.get = jest.fn(() => ({
          result: snippet,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getSnippet('1');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.get() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual(snippet);
      });

      it('should return null when snippet not found', async () => {
        mockObjectStore.get = jest.fn(() => ({
          result: undefined,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getSnippet('nonexistent');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.get() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toBeNull();
      });
    });

    describe('createSnippet', () => {
      it('should create snippet successfully', async () => {
        const snippet: Snippet = {
          id: '1',
          title: 'New',
          description: '',
          language: 'javascript',
          code: 'console.log("new")',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        };

        mockObjectStore.add = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.createSnippet(snippet);
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.add() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        await expect(promise).resolves.not.toThrow();
        expect(mockObjectStore.add).toHaveBeenCalledWith(snippet);
      });

      it('should handle duplicate key error', async () => {
        const snippet = { id: '1' } as Snippet;

        mockObjectStore.add = jest.fn(() => ({
          onerror: null,
          onsuccess: null,
          error: new Error('Duplicate key'),
        })) as any;

        const promise = idbStorage.createSnippet(snippet);
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.add() as any;
        if (request.onerror) {
          request.onerror(new Event('error'));
        }

        await expect(promise).rejects.toThrow();
      });
    });

    describe('updateSnippet', () => {
      it('should update snippet successfully', async () => {
        const snippet: Snippet = {
          id: '1',
          title: 'Updated',
          description: '',
          language: 'javascript',
          code: 'console.log("updated")',
          category: 'general',
          hasPreview: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          namespaceId: 'default',
          isTemplate: false,
        };

        mockObjectStore.put = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.updateSnippet(snippet);
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.put() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        await expect(promise).resolves.not.toThrow();
        expect(mockObjectStore.put).toHaveBeenCalledWith(snippet);
      });
    });

    describe('deleteSnippet', () => {
      it('should delete snippet successfully', async () => {
        mockObjectStore.delete = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.deleteSnippet('1');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.delete() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        await expect(promise).resolves.not.toThrow();
        expect(mockObjectStore.delete).toHaveBeenCalledWith('1');
      });

      it('should handle delete errors gracefully', async () => {
        mockObjectStore.delete = jest.fn(() => ({
          onerror: null,
          onsuccess: null,
          error: new Error('Delete failed'),
        })) as any;

        const promise = idbStorage.deleteSnippet('1');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.delete() as any;
        if (request.onerror) {
          request.onerror(new Event('error'));
        }

        await expect(promise).rejects.toThrow();
      });
    });

    describe('getSnippetsByNamespace', () => {
      it('should retrieve snippets by namespace', async () => {
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
            namespaceId: 'ns1',
            isTemplate: false,
          },
        ];

        mockObjectStore.getAll = jest.fn(() => ({
          result: snippets,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getSnippetsByNamespace('ns1');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.getAll() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual(snippets);
      });

      it('should return empty array when no snippets in namespace', async () => {
        mockObjectStore.getAll = jest.fn(() => ({
          result: [],
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getSnippetsByNamespace('empty-ns');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.getAll() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual([]);
      });
    });
  });

  describe('Namespace operations', () => {
    let mockTransaction: MockIDBTransaction;
    let mockObjectStore: MockIDBObjectStore;

    beforeEach(() => {
      mockTransaction = new MockIDBTransaction();
      mockObjectStore = new MockIDBObjectStore();

      mockDB.transaction = jest.fn(() => mockTransaction);
      mockTransaction.objectStore = jest.fn(() => mockObjectStore);
    });

    describe('getAllNamespaces', () => {
      it('should retrieve all namespaces', async () => {
        const namespaces: Namespace[] = [
          { id: '1', name: 'Default', description: '', createdAt: Date.now() },
        ];

        mockObjectStore.getAll = jest.fn(() => ({
          result: namespaces,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getAllNamespaces();
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.getAll() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual(namespaces);
      });
    });

    describe('getNamespace', () => {
      it('should retrieve namespace by id', async () => {
        const namespace: Namespace = {
          id: '1',
          name: 'Test',
          description: '',
          createdAt: Date.now(),
        };

        mockObjectStore.get = jest.fn(() => ({
          result: namespace,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getNamespace('1');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.get() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toEqual(namespace);
      });

      it('should return null when namespace not found', async () => {
        mockObjectStore.get = jest.fn(() => ({
          result: undefined,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getNamespace('nonexistent');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.get() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toBeNull();
      });
    });

    describe('createNamespace', () => {
      it('should create namespace successfully', async () => {
        const namespace: Namespace = {
          id: '1',
          name: 'New',
          description: '',
          createdAt: Date.now(),
        };

        mockObjectStore.add = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.createNamespace(namespace);
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.add() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        await expect(promise).resolves.not.toThrow();
      });
    });

    describe('updateNamespace', () => {
      it('should update namespace successfully', async () => {
        const namespace: Namespace = {
          id: '1',
          name: 'Updated',
          description: 'New description',
          createdAt: Date.now(),
        };

        mockObjectStore.put = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.updateNamespace(namespace);
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.put() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        await expect(promise).resolves.not.toThrow();
      });
    });

    describe('deleteNamespace', () => {
      it('should delete namespace successfully', async () => {
        mockObjectStore.delete = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.deleteNamespace('1');
        await new Promise(resolve => setTimeout(resolve, 10));

        const request = mockObjectStore.delete() as any;
        if (request.onsuccess) {
          request.onsuccess(new Event('success'));
        }

        await expect(promise).resolves.not.toThrow();
      });
    });
  });

  describe('Database operations', () => {
    let mockTransaction: MockIDBTransaction;
    let mockObjectStore: MockIDBObjectStore;

    beforeEach(() => {
      mockTransaction = new MockIDBTransaction();
      mockObjectStore = new MockIDBObjectStore();

      mockDB.transaction = jest.fn(() => mockTransaction);
      mockTransaction.objectStore = jest.fn(() => mockObjectStore);
    });

    describe('clearDatabase', () => {
      it('should clear all stores successfully', async () => {
        mockObjectStore.clear = jest.fn();

        const promise = idbStorage.clearDatabase();
        await new Promise(resolve => setTimeout(resolve, 10));

        if (mockTransaction.oncomplete) {
          mockTransaction.oncomplete(new Event('complete'));
        }

        await expect(promise).resolves.not.toThrow();
        expect(mockObjectStore.clear).toHaveBeenCalled();
      });

      it('should handle clear errors', async () => {
        const promise = idbStorage.clearDatabase();
        await new Promise(resolve => setTimeout(resolve, 10));

        mockTransaction.error = new Error('Clear failed');
        if (mockTransaction.onerror) {
          mockTransaction.onerror(new Event('error'));
        }

        await expect(promise).rejects.toThrow();
      });
    });

    describe('getDatabaseStats', () => {
      it('should return database statistics', async () => {
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
          {
            id: '2',
            title: 'Template',
            description: '',
            language: 'javascript',
            code: '',
            category: 'general',
            hasPreview: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            namespaceId: 'default',
            isTemplate: true,
          },
        ];

        mockObjectStore.getAll = jest.fn(() => ({
          result: snippets,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.getDatabaseStats();
        await new Promise(resolve => setTimeout(resolve, 20));

        const requests = mockObjectStore.getAll();
        for (let i = 0; i < 2; i++) {
          if (requests.onsuccess) {
            requests.onsuccess(new Event('success'));
          }
        }

        const stats = await promise;
        expect(stats).toHaveProperty('snippetCount');
        expect(stats).toHaveProperty('templateCount');
        expect(stats).toHaveProperty('namespaceCount');
      });
    });

    describe('exportDatabase', () => {
      it('should export database successfully', async () => {
        const snippets: Snippet[] = [];
        const namespaces: Namespace[] = [];

        mockObjectStore.getAll = jest.fn(() => ({
          result: snippets,
          onsuccess: null,
          onerror: null,
        })) as any;

        const promise = idbStorage.exportDatabase();
        await new Promise(resolve => setTimeout(resolve, 20));

        const requests = mockObjectStore.getAll();
        if (requests.onsuccess) {
          requests.onsuccess(new Event('success'));
        }

        const result = await promise;
        expect(result).toHaveProperty('snippets');
        expect(result).toHaveProperty('namespaces');
      });
    });

    describe('importDatabase', () => {
      it('should import database successfully', async () => {
        mockObjectStore.add = jest.fn(() => ({
          onsuccess: null,
          onerror: null,
        })) as any;

        mockObjectStore.clear = jest.fn();

        const data = {
          snippets: [] as Snippet[],
          namespaces: [] as Namespace[],
        };

        const promise = idbStorage.importDatabase(data);
        await new Promise(resolve => setTimeout(resolve, 20));

        if (mockTransaction.oncomplete) {
          mockTransaction.oncomplete(new Event('complete'));
        }

        await expect(promise).resolves.not.toThrow();
      });

      it('should handle import errors', async () => {
        mockObjectStore.clear = jest.fn();

        const data = {
          snippets: [] as Snippet[],
          namespaces: [] as Namespace[],
        };

        const promise = idbStorage.importDatabase(data);
        await new Promise(resolve => setTimeout(resolve, 10));

        mockTransaction.error = new Error('Import failed');
        if (mockTransaction.onerror) {
          mockTransaction.onerror(new Event('error'));
        }

        await expect(promise).rejects.toThrow();
      });
    });
  });
});
