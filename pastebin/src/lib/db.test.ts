import * as db from './db';
import * as storage from './storage';
import * as indexeddbStorage from './indexeddb-storage';
import type { Snippet, Namespace } from './types';

jest.mock('./storage');
jest.mock('./indexeddb-storage');

const mockStorageModule = storage as jest.Mocked<typeof storage>;
const mockIndexedDBModule = indexeddbStorage as jest.Mocked<typeof indexeddbStorage>;

// Helper to create a test snippet
const createTestSnippet = (overrides?: Partial<Snippet>): Snippet => ({
  id: 'test-1',
  title: 'Test Snippet',
  description: 'A test snippet',
  code: 'console.log("test")',
  language: 'javascript',
  namespaceId: 'default',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  isTemplate: false,
  tags: [],
  ...overrides,
});

// Helper to create a test namespace
const createTestNamespace = (overrides?: Partial<Namespace>): Namespace => ({
  id: 'default',
  name: 'Default',
  createdAt: Date.now(),
  isDefault: true,
  ...overrides,
});

describe('db - Unified Storage Interface', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorageModule.getStorageConfig.mockReturnValue({
      backend: 'indexeddb',
      flaskUrl: '',
      preferredBackend: 'indexeddb',
    });
  });

  describe('Snippet operations - IndexedDB backend', () => {
    beforeEach(() => {
      mockStorageModule.getStorageConfig.mockReturnValue({
        backend: 'indexeddb',
        flaskUrl: '',
        preferredBackend: 'indexeddb',
      });
    });

    it('should get all snippets from IndexedDB', async () => {
      const snippets = [createTestSnippet()];
      mockIndexedDBModule.getAllSnippets.mockResolvedValue(snippets);

      const result = await db.getAllSnippets();

      expect(result).toEqual(snippets);
      expect(mockIndexedDBModule.getAllSnippets).toHaveBeenCalled();
    });

    it('should get a single snippet from IndexedDB', async () => {
      const snippet = createTestSnippet();
      mockIndexedDBModule.getSnippet.mockResolvedValue(snippet);

      const result = await db.getSnippet('test-1');

      expect(result).toEqual(snippet);
      expect(mockIndexedDBModule.getSnippet).toHaveBeenCalledWith('test-1');
    });

    it('should return null for non-existent snippet', async () => {
      mockIndexedDBModule.getSnippet.mockResolvedValue(null);

      const result = await db.getSnippet('nonexistent');

      expect(result).toBeNull();
    });

    it('should create snippet in IndexedDB', async () => {
      const snippet = createTestSnippet();
      mockIndexedDBModule.createSnippet.mockResolvedValue(undefined);

      await db.createSnippet(snippet);

      expect(mockIndexedDBModule.createSnippet).toHaveBeenCalledWith(snippet);
    });

    it('should update snippet in IndexedDB', async () => {
      const snippet = createTestSnippet({ title: 'Updated' });
      mockIndexedDBModule.updateSnippet.mockResolvedValue(undefined);

      await db.updateSnippet(snippet);

      expect(mockIndexedDBModule.updateSnippet).toHaveBeenCalledWith(snippet);
    });

    it('should delete snippet from IndexedDB', async () => {
      mockIndexedDBModule.deleteSnippet.mockResolvedValue(undefined);

      await db.deleteSnippet('test-1');

      expect(mockIndexedDBModule.deleteSnippet).toHaveBeenCalledWith('test-1');
    });

    it('should get snippets by namespace', async () => {
      const snippets = [createTestSnippet({ namespaceId: 'test-ns' })];
      mockIndexedDBModule.getSnippetsByNamespace.mockResolvedValue(snippets);

      const result = await db.getSnippetsByNamespace('test-ns');

      expect(result).toEqual(snippets);
      expect(mockIndexedDBModule.getSnippetsByNamespace).toHaveBeenCalledWith('test-ns');
    });
  });

  describe('Snippet operations - Flask backend', () => {
    let mockFlaskAdapter: any;

    beforeEach(() => {
      mockFlaskAdapter = {
        getAllSnippets: jest.fn(),
        getSnippet: jest.fn(),
        createSnippet: jest.fn(),
        updateSnippet: jest.fn(),
        deleteSnippet: jest.fn(),
        getSnippetsByNamespace: jest.fn(),
        getAllNamespaces: jest.fn(),
        getNamespace: jest.fn(),
        createNamespace: jest.fn(),
        deleteNamespace: jest.fn(),
        testConnection: jest.fn(),
        clearDatabase: jest.fn(),
        getStats: jest.fn(),
        exportDatabase: jest.fn(),
        importDatabase: jest.fn(),
      };

      mockStorageModule.getStorageConfig.mockReturnValue({
        backend: 'flask',
        flaskUrl: 'http://localhost:5000',
        preferredBackend: 'flask',
      });
      mockStorageModule.FlaskStorageAdapter = jest.fn(() => mockFlaskAdapter);
    });

    it('should route snippet operations to Flask backend', async () => {
      const snippet = createTestSnippet();
      mockFlaskAdapter.getAllSnippets.mockResolvedValue([snippet]);

      const result = await db.getAllSnippets();

      expect(result).toEqual([snippet]);
      expect(mockFlaskAdapter.getAllSnippets).toHaveBeenCalled();
    });

    it('should create snippet via Flask backend', async () => {
      const snippet = createTestSnippet();
      mockFlaskAdapter.createSnippet.mockResolvedValue(undefined);

      await db.createSnippet(snippet);

      expect(mockFlaskAdapter.createSnippet).toHaveBeenCalledWith(snippet);
    });
  });

  describe('moveSnippetToNamespace', () => {
    it('should move snippet to new namespace', async () => {
      const snippet = createTestSnippet({ namespaceId: 'old-ns', updatedAt: 1000 });
      mockIndexedDBModule.getSnippet.mockResolvedValue(snippet);
      mockIndexedDBModule.updateSnippet.mockResolvedValue(undefined);

      await db.moveSnippetToNamespace('test-1', 'new-ns');

      expect(mockIndexedDBModule.getSnippet).toHaveBeenCalledWith('test-1');
      expect(mockIndexedDBModule.updateSnippet).toHaveBeenCalled();

      const updatedSnippet = (mockIndexedDBModule.updateSnippet as jest.Mock).mock.calls[0][0];
      expect(updatedSnippet.namespaceId).toBe('new-ns');
      expect(updatedSnippet.updatedAt).toBeGreaterThan(1000);
    });

    it('should throw error if snippet not found', async () => {
      mockIndexedDBModule.getSnippet.mockResolvedValue(null);

      await expect(db.moveSnippetToNamespace('nonexistent', 'new-ns')).rejects.toThrow(
        'Snippet not found'
      );
    });

    it('should update the updatedAt timestamp', async () => {
      const snippet = createTestSnippet();
      const beforeTime = Date.now();
      mockIndexedDBModule.getSnippet.mockResolvedValue(snippet);
      mockIndexedDBModule.updateSnippet.mockResolvedValue(undefined);

      await db.moveSnippetToNamespace('test-1', 'new-ns');

      const updatedSnippet = (mockIndexedDBModule.updateSnippet as jest.Mock).mock.calls[0][0];
      expect(updatedSnippet.updatedAt).toBeGreaterThanOrEqual(beforeTime);
    });
  });

  describe('bulkMoveSnippets', () => {
    it('should move multiple snippets to namespace', async () => {
      const snippet1 = createTestSnippet({ id: 'snippet-1' });
      const snippet2 = createTestSnippet({ id: 'snippet-2' });

      mockIndexedDBModule.getSnippet
        .mockResolvedValueOnce(snippet1)
        .mockResolvedValueOnce(snippet2);
      mockIndexedDBModule.updateSnippet.mockResolvedValue(undefined);

      await db.bulkMoveSnippets(['snippet-1', 'snippet-2'], 'target-ns');

      expect(mockIndexedDBModule.getSnippet).toHaveBeenCalledTimes(2);
      expect(mockIndexedDBModule.updateSnippet).toHaveBeenCalledTimes(2);
    });

    it('should stop on first error', async () => {
      mockIndexedDBModule.getSnippet.mockResolvedValueOnce(null);

      await expect(
        db.bulkMoveSnippets(['snippet-1', 'snippet-2'], 'target-ns')
      ).rejects.toThrow();

      expect(mockIndexedDBModule.getSnippet).toHaveBeenCalledTimes(1);
    });
  });

  describe('Template operations', () => {
    it('should get all templates', async () => {
      const template = createTestSnippet({ isTemplate: true });
      const regular = createTestSnippet({ isTemplate: false });
      mockIndexedDBModule.getAllSnippets.mockResolvedValue([template, regular]);

      const result = await db.getAllTemplates();

      expect(result).toEqual([template]);
      expect(result).toHaveLength(1);
    });

    it('should filter out non-templates', async () => {
      const snippets = [
        createTestSnippet({ isTemplate: true }),
        createTestSnippet({ isTemplate: false }),
        createTestSnippet({ isTemplate: true }),
      ];
      mockIndexedDBModule.getAllSnippets.mockResolvedValue(snippets);

      const result = await db.getAllTemplates();

      expect(result).toHaveLength(2);
      expect(result.every(s => s.isTemplate)).toBe(true);
    });

    it('should create template with generated ID and timestamps', async () => {
      const templateData = {
        title: 'Template',
        description: 'A template',
        code: 'code',
        language: 'js',
        namespaceId: 'default',
        tags: [],
      };
      mockIndexedDBModule.createSnippet.mockResolvedValue(undefined);

      await db.createTemplate(templateData);

      expect(mockIndexedDBModule.createSnippet).toHaveBeenCalled();
      const created = (mockIndexedDBModule.createSnippet as jest.Mock).mock.calls[0][0];

      expect(created).toMatchObject({
        ...templateData,
        isTemplate: true,
      });
      expect(created.id).toBeDefined();
      expect(created.createdAt).toBeDefined();
      expect(created.updatedAt).toBeDefined();
    });

    it('should sync templates from JSON', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const templates = [{}, {}, {}];

      await db.syncTemplatesFromJSON(templates);

      expect(consoleSpy).toHaveBeenCalledWith('Syncing templates', 3);
      consoleSpy.mockRestore();
    });
  });

  describe('Namespace operations', () => {
    it('should get all namespaces', async () => {
      const ns = createTestNamespace();
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([ns]);

      const result = await db.getAllNamespaces();

      expect(result).toEqual([ns]);
    });

    it('should get namespace by ID', async () => {
      const ns = createTestNamespace();
      mockIndexedDBModule.getNamespace.mockResolvedValue(ns);

      const result = await db.getNamespaceById('default');

      expect(result).toEqual(ns);
      expect(mockIndexedDBModule.getNamespace).toHaveBeenCalledWith('default');
    });

    it('should create namespace', async () => {
      const ns = createTestNamespace();
      mockIndexedDBModule.createNamespace.mockResolvedValue(undefined);

      await db.createNamespace(ns);

      expect(mockIndexedDBModule.createNamespace).toHaveBeenCalledWith(ns);
    });

    it('should delete namespace', async () => {
      mockIndexedDBModule.deleteNamespace.mockResolvedValue(undefined);

      await db.deleteNamespace('default');

      expect(mockIndexedDBModule.deleteNamespace).toHaveBeenCalledWith('default');
    });
  });

  describe('ensureDefaultNamespace', () => {
    it('should return existing default namespace', async () => {
      const defaultNs = createTestNamespace({ isDefault: true });
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([defaultNs]);

      const result = await db.ensureDefaultNamespace();

      expect(result).toEqual(defaultNs);
      expect(mockIndexedDBModule.createNamespace).not.toHaveBeenCalled();
    });

    it('should create default namespace if not exists', async () => {
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([]);
      mockIndexedDBModule.createNamespace.mockResolvedValue(undefined);

      const result = await db.ensureDefaultNamespace();

      expect(result).toMatchObject({
        id: 'default',
        name: 'Default',
        isDefault: true,
      });
      expect(mockIndexedDBModule.createNamespace).toHaveBeenCalled();
    });

    it('should not create duplicate default namespaces', async () => {
      const defaultNs = createTestNamespace({ isDefault: true });
      const otherNs = createTestNamespace({ id: 'other', isDefault: false });
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([otherNs, defaultNs]);

      await db.ensureDefaultNamespace();

      expect(mockIndexedDBModule.createNamespace).not.toHaveBeenCalled();
    });
  });

  describe('Database operations', () => {
    it('should initialize database', async () => {
      mockIndexedDBModule.openDB.mockResolvedValue(undefined);
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([]);
      mockIndexedDBModule.createNamespace.mockResolvedValue(undefined);

      await db.initDB();

      expect(mockIndexedDBModule.openDB).toHaveBeenCalled();
      expect(mockIndexedDBModule.getAllNamespaces).toHaveBeenCalled();
    });

    it('should throw error if Flask connection fails', async () => {
      mockStorageModule.getStorageConfig.mockReturnValue({
        backend: 'flask',
        flaskUrl: 'http://localhost:5000',
        preferredBackend: 'flask',
      });
      const mockFlask = {
        testConnection: jest.fn().mockResolvedValue(false),
      };
      mockStorageModule.FlaskStorageAdapter = jest.fn(() => mockFlask);

      await expect(db.initDB()).rejects.toThrow('Failed to connect to Flask backend');
    });

    it('should clear database', async () => {
      mockIndexedDBModule.clearDatabase.mockResolvedValue(undefined);

      await db.clearDatabase();

      expect(mockIndexedDBModule.clearDatabase).toHaveBeenCalled();
    });

    it('should get database stats', async () => {
      const stats = { snippetCount: 5, namespaceCount: 2 };
      mockIndexedDBModule.getDatabaseStats.mockResolvedValue(stats);

      const result = await db.getDatabaseStats();

      expect(result).toEqual(stats);
    });

    it('should export database as JSON string', async () => {
      const data = { snippets: [], namespaces: [] };
      mockIndexedDBModule.exportDatabase.mockResolvedValue(data);

      const result = await db.exportDatabase();

      expect(typeof result).toBe('string');
      expect(JSON.parse(result)).toEqual(data);
    });

    it('should import database from JSON string', async () => {
      const data = { snippets: [], namespaces: [] };
      const jsonStr = JSON.stringify(data);
      mockIndexedDBModule.importDatabase.mockResolvedValue(undefined);

      await db.importDatabase(jsonStr);

      expect(mockIndexedDBModule.importDatabase).toHaveBeenCalledWith(data);
    });

    it('should validate database schema', async () => {
      const result = await db.validateDatabaseSchema();

      expect(result).toBe(true);
    });

    it('should handle saveDB as no-op', async () => {
      // Should not throw
      await db.saveDB();
    });
  });

  describe('seedDatabase', () => {
    it('should seed database with default namespace', async () => {
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([]);
      mockIndexedDBModule.createNamespace.mockResolvedValue(undefined);

      await db.seedDatabase();

      expect(mockIndexedDBModule.getAllNamespaces).toHaveBeenCalled();
      expect(mockIndexedDBModule.createNamespace).toHaveBeenCalled();
    });

    it('should not create namespace if one exists', async () => {
      const ns = createTestNamespace();
      mockIndexedDBModule.getAllNamespaces.mockResolvedValue([ns]);

      await db.seedDatabase();

      expect(mockIndexedDBModule.createNamespace).not.toHaveBeenCalled();
    });
  });
});
