import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  callOrder,
  mockFlaskGet,
  mockIndexedGet,
  mockSQLiteGet,
  mockSparkGet,
  MockFlaskBackendAdapter,
  MockIndexedDBAdapter,
  MockSQLiteAdapter,
  MockSparkKVAdapter
} = vi.hoisted(() => {
  const callOrder: string[] = []
  const mockFlaskGet = vi.fn<[], Promise<unknown>>()
  const mockIndexedGet = vi.fn<[], Promise<unknown>>()
  const mockSQLiteGet = vi.fn<[], Promise<unknown>>()
  const mockSparkGet = vi.fn<[], Promise<unknown>>()

  class MockFlaskBackendAdapter {
    constructor() {
      callOrder.push('flask')
    }

    get = mockFlaskGet
  }

  class MockIndexedDBAdapter {
    constructor() {
      callOrder.push('indexeddb')
    }

    get = mockIndexedGet
  }

  class MockSQLiteAdapter {
    constructor() {
      callOrder.push('sqlite')
    }

    get = mockSQLiteGet
  }

  class MockSparkKVAdapter {
    constructor() {
      callOrder.push('sparkkv')
    }

    get = mockSparkGet
  }

  return {
    callOrder,
    mockFlaskGet,
    mockIndexedGet,
    mockSQLiteGet,
    mockSparkGet,
    MockFlaskBackendAdapter,
    MockIndexedDBAdapter,
    MockSQLiteAdapter,
    MockSparkKVAdapter
  }
})

vi.mock('./unified-storage-adapters', () => ({
  FlaskBackendAdapter: MockFlaskBackendAdapter,
  IndexedDBAdapter: MockIndexedDBAdapter,
  SQLiteAdapter: MockSQLiteAdapter,
  SparkKVAdapter: MockSparkKVAdapter
}))

const createLocalStorageMock = () => {
  const store = new Map<string, string>()

  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key)
    }),
    clear: vi.fn(() => {
      store.clear()
    })
  }
}

describe('UnifiedStorage.detectAndInitialize', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>

  beforeEach(() => {
    vi.resetModules()
    callOrder.length = 0
    mockFlaskGet.mockReset()
    mockIndexedGet.mockReset()
    mockSQLiteGet.mockReset()
    mockSparkGet.mockReset()

    localStorageMock = createLocalStorageMock()
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('window', { spark: undefined })

    if (!(import.meta as { env?: Record<string, string | undefined> }).env) {
      ;(import.meta as { env?: Record<string, string | undefined> }).env = {}
    }
  })

  it('tries Flask before IndexedDB when prefer-flask is set', async () => {
    localStorageMock.setItem('codeforge-prefer-flask', 'true')
    mockFlaskGet.mockRejectedValue(new Error('flask down'))
    mockIndexedGet.mockResolvedValue(undefined)
    vi.stubGlobal('indexedDB', {})

    const { unifiedStorage } = await import('./unified-storage')
    await unifiedStorage.getBackend()

    expect(callOrder[0]).toBe('flask')
    expect(callOrder).toContain('indexeddb')
  })

  it('falls back to IndexedDB when Flask initialization fails', async () => {
    localStorageMock.setItem('codeforge-prefer-flask', 'true')
    mockFlaskGet.mockRejectedValue(new Error('flask down'))
    mockIndexedGet.mockResolvedValue(undefined)
    vi.stubGlobal('indexedDB', {})

    const { unifiedStorage } = await import('./unified-storage')
    const backend = await unifiedStorage.getBackend()

    expect(backend).toBe('indexeddb')
  })

  it('honors prefer-sqlite when configured', async () => {
    localStorageMock.setItem('codeforge-prefer-sqlite', 'true')
    mockSQLiteGet.mockResolvedValue(undefined)
    delete (globalThis as { indexedDB?: unknown }).indexedDB

    const { unifiedStorage } = await import('./unified-storage')
    const backend = await unifiedStorage.getBackend()

    expect(backend).toBe('sqlite')
    expect(callOrder).toContain('sqlite')
  })
})
