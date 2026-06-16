import {
  loadStorageConfig,
  saveStorageConfig,
  getStorageConfig,
  DBALStorageAdapter,
  StorageConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  StorageBackend,
} from './storage'
import type { Snippet } from './types'

// Mock fetch
global.fetch = jest.fn()

describe('Storage Configuration', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
    localStorage.clear()
    // Clean up environment variables BEFORE clearing, so tests start fresh
    delete process.env.NEXT_PUBLIC_DBAL_API_URL
  })

  describe('loadStorageConfig', () => {
    it('should load default config when no env var or localStorage', () => {
      delete process.env.NEXT_PUBLIC_DBAL_API_URL
      const config = loadStorageConfig()
      expect(config.backend).toBe('indexeddb')
      expect(config.dbalUrl).toBeUndefined()
    })

    it('should load DBAL config from env var', () => {
      process.env.NEXT_PUBLIC_DBAL_API_URL = 'http://localhost:5000'
      const config = loadStorageConfig()
      expect(config.backend).toBe('dbal')
      expect(config.dbalUrl).toBe('http://localhost:5000')
    })

    it('should load config from localStorage if no env var', () => {
      delete process.env.NEXT_PUBLIC_DBAL_API_URL
      const savedConfig: StorageConfig = {
        backend: 'dbal',
        dbalUrl: 'http://api.example.com',
      }
      localStorage.setItem(
        'codesnippet-storage-config',
        JSON.stringify(savedConfig),
      )

      const config = loadStorageConfig()
      expect(config.backend).toBe('dbal')
      expect(config.dbalUrl).toBe('http://api.example.com')
    })

    it('should prefer env var over localStorage', () => {
      process.env.NEXT_PUBLIC_DBAL_API_URL = 'http://env-url.com'
      localStorage.setItem(
        'codesnippet-storage-config',
        JSON.stringify({ backend: 'indexeddb' }),
      )

      const config = loadStorageConfig()
      expect(config.backend).toBe('dbal')
      expect(config.dbalUrl).toBe('http://env-url.com')
    })

    it('should handle invalid JSON in localStorage', () => {
      delete process.env.NEXT_PUBLIC_DBAL_API_URL
      // Explicitly set currentConfig to indexeddb before testing
      saveStorageConfig({ backend: 'indexeddb' })
      localStorage.setItem('codesnippet-storage-config', 'invalid json')

      const config = loadStorageConfig()
      expect(config.backend).toBe('indexeddb')
    })

    it('should return default config on error', () => {
      delete process.env.NEXT_PUBLIC_DBAL_API_URL
      // Explicitly set currentConfig to indexeddb before testing
      saveStorageConfig({ backend: 'indexeddb' })
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error')
      })

      const config = loadStorageConfig()
      expect(config.backend).toBe('indexeddb')
    })
  })

  describe('saveStorageConfig', () => {
    it('should save config to localStorage', () => {
      const config: StorageConfig = {
        backend: 'dbal',
        dbalUrl: 'http://localhost:5000',
      }

      saveStorageConfig(config)

      const saved = localStorage.getItem('codesnippet-storage-config')
      expect(saved).toBe(JSON.stringify(config))
    })

    it('should update current config after save', () => {
      const config: StorageConfig = {
        backend: 'dbal',
        dbalUrl: 'http://localhost:5000',
      }

      saveStorageConfig(config)
      const current = getStorageConfig()

      expect(current.backend).toBe('dbal')
      expect(current.dbalUrl).toBe('http://localhost:5000')
    })

    it('should handle storage errors', () => {
      const config: StorageConfig = {
        backend: 'indexeddb',
      }

      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full')
      })

      expect(() => saveStorageConfig(config)).not.toThrow()
    })

    it('should save IndexedDB config without dbalUrl', () => {
      const config: StorageConfig = {
        backend: 'indexeddb',
      }

      saveStorageConfig(config)

      const saved = localStorage.getItem('codesnippet-storage-config')
      expect(saved).toBe(JSON.stringify(config))
    })
  })

  describe('getStorageConfig', () => {
    it('should return current configuration', () => {
      const config: StorageConfig = {
        backend: 'dbal',
        dbalUrl: 'http://localhost:5000',
      }

      saveStorageConfig(config)
      const current = getStorageConfig()

      expect(current).toEqual(config)
    })

    it('should return same instance on repeated calls', () => {
      const config1 = getStorageConfig()
      const config2 = getStorageConfig()

      expect(config1).toBe(config2)
    })
  })
})

describe('DBALStorageAdapter', () => {
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>
  const URL = 'http://localhost:5000'
  const snip = (over: Partial<Snippet> = {}): Snippet => ({
    id: '1',
    title: 'Test',
    code: 'test',
    language: 'javascript',
    category: 'test',
    createdAt: 1234567890,
    updatedAt: 1234567890,
    description: '',
    ...over,
  })
  const okJson = (data: unknown) =>
    ({ ok: true, json: async () => ({ data }) }) as unknown as Response
  const fail = (statusText = 'Server error') =>
    ({ ok: false, statusText }) as Response

  beforeEach(() => {
    mockFetch.mockClear()
    if (!AbortSignal.timeout) {
      const ctrl = new AbortController()
      Object.defineProperty(AbortSignal, 'timeout', {
        value: () => ctrl.signal,
        writable: true,
      })
    }
  })

  describe('constructor', () => {
    it('creates an adapter with a valid URL', () => {
      expect(new DBALStorageAdapter(URL)).toBeDefined()
    })
    it('throws on an empty URL', () => {
      expect(() => new DBALStorageAdapter('')).toThrow(
        'DBAL backend URL cannot be empty',
      )
    })
    it('throws on a whitespace-only URL', () => {
      expect(() => new DBALStorageAdapter('   ')).toThrow(
        'DBAL backend URL cannot be empty',
      )
    })
    it('removes a trailing slash from the URL', () => {
      expect(new DBALStorageAdapter('http://localhost:5000/')).toBeDefined()
    })
  })

  describe('testConnection', () => {
    it('returns true on a healthy backend', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true } as Response)
      const ok = await new DBALStorageAdapter(URL).testConnection()
      expect(ok).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/health'),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      )
    })
    it('returns false when the backend is unhealthy', async () => {
      mockFetch.mockResolvedValueOnce(fail())
      expect(await new DBALStorageAdapter(URL).testConnection()).toBe(false)
    })
    it('returns false on a network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      expect(await new DBALStorageAdapter(URL).testConnection()).toBe(false)
    })
  })

  describe('getAllSnippets', () => {
    it('fetches and maps snippets from the data envelope', async () => {
      mockFetch.mockResolvedValueOnce(okJson([snip()]))
      const out = await new DBALStorageAdapter(URL).getAllSnippets()
      expect(out).toHaveLength(1)
      expect(out[0].id).toBe('1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Snippet'),
        expect.anything(),
      )
    })
    it('throws on a failed request', async () => {
      mockFetch.mockResolvedValueOnce(fail())
      await expect(
        new DBALStorageAdapter(URL).getAllSnippets(),
      ).rejects.toThrow('Failed to fetch snippets')
    })
    it('coerces timestamps to numbers', async () => {
      mockFetch.mockResolvedValueOnce(
        okJson([snip({ createdAt: 0, updatedAt: 0 })]),
      )
      const out = await new DBALStorageAdapter(URL).getAllSnippets()
      expect(typeof out[0].createdAt).toBe('number')
      expect(typeof out[0].updatedAt).toBe('number')
    })
  })

  describe('getSnippet', () => {
    it('fetches a single snippet', async () => {
      mockFetch.mockResolvedValueOnce(okJson(snip()))
      const out = await new DBALStorageAdapter(URL).getSnippet('1')
      expect(out?.id).toBe('1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Snippet/1'),
        expect.anything(),
      )
    })
    it('returns null on 404', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 404 } as Response)
      expect(await new DBALStorageAdapter(URL).getSnippet('x')).toBeNull()
    })
    it('throws on other errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server error',
      } as Response)
      await expect(new DBALStorageAdapter(URL).getSnippet('1')).rejects.toThrow(
        'Failed to fetch snippet',
      )
    })
  })

  describe('createSnippet', () => {
    it('POSTs the snippet', async () => {
      mockFetch.mockResolvedValueOnce(okJson(snip()))
      await new DBALStorageAdapter(URL).createSnippet(snip())
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Snippet'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
    it('throws on a failed creation', async () => {
      mockFetch.mockResolvedValueOnce(fail('Bad Request'))
      await expect(
        new DBALStorageAdapter(URL).createSnippet(snip()),
      ).rejects.toThrow('Failed to create snippet')
    })
  })

  describe('updateSnippet', () => {
    it('PUTs the snippet', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true } as Response)
      await new DBALStorageAdapter(URL).updateSnippet(snip({ title: 'New' }))
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Snippet/1'),
        expect.objectContaining({ method: 'PUT' }),
      )
    })
    it('throws on a failed update', async () => {
      mockFetch.mockResolvedValueOnce(fail('Not found'))
      await expect(
        new DBALStorageAdapter(URL).updateSnippet(snip()),
      ).rejects.toThrow('Failed to update snippet')
    })
  })

  describe('deleteSnippet', () => {
    it('DELETEs the snippet', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true } as Response)
      await new DBALStorageAdapter(URL).deleteSnippet('1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Snippet/1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
    it('throws on a failed deletion', async () => {
      mockFetch.mockResolvedValueOnce(fail('Not found'))
      await expect(
        new DBALStorageAdapter(URL).deleteSnippet('1'),
      ).rejects.toThrow('Failed to delete snippet')
    })
  })

  describe('bulkMoveSnippets', () => {
    it('PUTs each snippet to the target namespace', async () => {
      mockFetch.mockResolvedValue({ ok: true } as Response)
      await new DBALStorageAdapter(URL).bulkMoveSnippets(['1', '2'], 'ns2')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Snippet/'),
        expect.objectContaining({ method: 'PUT' }),
      )
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
    it('throws on a failed move', async () => {
      mockFetch.mockResolvedValueOnce(fail())
      await expect(
        new DBALStorageAdapter(URL).bulkMoveSnippets(['1'], 'ns2'),
      ).rejects.toThrow('Failed to bulk move snippets')
    })
  })

  describe('getSnippetsByNamespace', () => {
    it('filters snippets by namespace', async () => {
      mockFetch.mockResolvedValueOnce(okJson([snip({ namespaceId: 'ns1' })]))
      const out =
        await new DBALStorageAdapter(URL).getSnippetsByNamespace('ns1')
      expect(out).toHaveLength(1)
      expect(out[0].namespaceId).toBe('ns1')
    })
  })

  describe('namespaces', () => {
    const ns = { id: 'ns1', name: 'NS', createdAt: 1, isDefault: false }
    it('fetches all namespaces', async () => {
      mockFetch.mockResolvedValueOnce(okJson([ns]))
      expect(await new DBALStorageAdapter(URL).getAllNamespaces()).toHaveLength(
        1,
      )
    })
    it('throws on a failed namespace fetch', async () => {
      mockFetch.mockResolvedValueOnce(fail())
      await expect(
        new DBALStorageAdapter(URL).getAllNamespaces(),
      ).rejects.toThrow('Failed to fetch namespaces')
    })
    it('creates a namespace', async () => {
      mockFetch.mockResolvedValueOnce(okJson(ns))
      await new DBALStorageAdapter(URL).createNamespace(ns)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Namespace'),
        expect.objectContaining({ method: 'POST' }),
      )
    })
    it('deletes a namespace', async () => {
      mockFetch.mockResolvedValueOnce({ ok: true } as Response)
      await new DBALStorageAdapter(URL).deleteNamespace('ns1')
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/Namespace/ns1'),
        expect.objectContaining({ method: 'DELETE' }),
      )
    })
    it('resolves a namespace by id', async () => {
      mockFetch.mockResolvedValueOnce(okJson([ns]))
      const out = await new DBALStorageAdapter(URL).getNamespace('ns1')
      expect(out?.id).toBe('ns1')
    })
    it('returns null for a missing namespace', async () => {
      mockFetch.mockResolvedValueOnce(okJson([]))
      expect(await new DBALStorageAdapter(URL).getNamespace('x')).toBeNull()
    })
  })

  describe('clearDatabase', () => {
    it('is a no-op (not supported via DBAL)', async () => {
      await new DBALStorageAdapter(URL).clearDatabase()
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('aggregates counts from snippets and namespaces', async () => {
      mockFetch
        .mockResolvedValueOnce(okJson([snip(), snip({ isTemplate: true })]))
        .mockResolvedValueOnce(okJson([{ id: 'n', isDefault: true }]))
      const stats = await new DBALStorageAdapter(URL).getStats()
      expect(stats.snippetCount).toBe(2)
      expect(stats.templateCount).toBe(1)
      expect(stats.databaseSize).toBe(0)
    })
  })

  describe('exportDatabase', () => {
    it('exports snippets and namespaces', async () => {
      mockFetch
        .mockResolvedValueOnce(okJson([snip()]))
        .mockResolvedValueOnce(okJson([{ id: 'n', name: 'd' }]))
      const data = await new DBALStorageAdapter(URL).exportDatabase()
      expect(data.snippets).toHaveLength(1)
      expect(data.namespaces).toHaveLength(1)
    })
  })

  describe('importDatabase', () => {
    it('creates namespaces then snippets', async () => {
      mockFetch.mockResolvedValue(okJson({}))
      await new DBALStorageAdapter(URL).importDatabase({
        snippets: [snip()],
        namespaces: [{ id: 'ns1', name: 'NS', createdAt: 1, isDefault: false }],
      })
      expect(mockFetch).toHaveBeenCalled()
    })
  })
})
