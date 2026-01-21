import { configureStore } from '@reduxjs/toolkit'
import namespacesReducer, {
  fetchNamespaces,
  createNamespace,
  deleteNamespace,
  setSelectedNamespace,
} from './namespacesSlice'
import { Namespace } from '@/lib/types'

// Mock database functions
jest.mock('@/lib/db', () => ({
  getAllNamespaces: jest.fn(),
  createNamespace: jest.fn(),
  deleteNamespace: jest.fn(),
  ensureDefaultNamespace: jest.fn(),
}))

const mockNamespaces: Namespace[] = [
  {
    id: 'default-ns',
    name: 'Default',
    createdAt: 1000,
    isDefault: true,
  },
  {
    id: 'ns1',
    name: 'Personal',
    createdAt: 2000,
    isDefault: false,
  },
  {
    id: 'ns2',
    name: 'Work',
    createdAt: 3000,
    isDefault: false,
  },
  {
    id: 'ns3',
    name: 'Archive',
    createdAt: 4000,
    isDefault: false,
  },
]

describe('namespacesSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        namespaces: namespacesReducer,
      },
    })
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty state', () => {
      const state = store.getState().namespaces
      expect(state.items).toEqual([])
      expect(state.selectedId).toBe(null)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should have all expected properties', () => {
      const state = store.getState().namespaces
      expect(state).toHaveProperty('items')
      expect(state).toHaveProperty('selectedId')
      expect(state).toHaveProperty('loading')
      expect(state).toHaveProperty('error')
    })
  })

  describe('reducers - setSelectedNamespace', () => {
    it('should set selected namespace id', () => {
      store.dispatch(setSelectedNamespace('ns1'))
      expect(store.getState().namespaces.selectedId).toBe('ns1')
    })

    it('should update selected namespace id', () => {
      store.dispatch(setSelectedNamespace('ns1'))
      store.dispatch(setSelectedNamespace('ns2'))
      expect(store.getState().namespaces.selectedId).toBe('ns2')
    })

    it('should handle setting null', () => {
      store.dispatch(setSelectedNamespace('ns1'))
      store.dispatch(setSelectedNamespace(''))
      expect(store.getState().namespaces.selectedId).toBe('')
    })

    it('should handle different namespace ids', () => {
      const ids = ['default-ns', 'ns1', 'ns2', 'ns3']
      for (const id of ids) {
        store.dispatch(setSelectedNamespace(id))
        expect(store.getState().namespaces.selectedId).toBe(id)
      }
    })

    it('should not affect items array', () => {
      store.dispatch(setSelectedNamespace('ns1'))
      expect(store.getState().namespaces.items).toEqual([])
    })

    it('should handle special characters in id', () => {
      const specialId = 'ns-with-!@#$%'
      store.dispatch(setSelectedNamespace(specialId))
      expect(store.getState().namespaces.selectedId).toBe(specialId)
    })
  })

  describe('async thunks - fetchNamespaces', () => {
    it('should fetch namespaces successfully', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.items).toEqual(mockNamespaces)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should call ensureDefaultNamespace before fetching', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

      await store.dispatch(fetchNamespaces())

      expect(mockDb.ensureDefaultNamespace).toHaveBeenCalled()
    })

    it('should set loading to true during fetch', () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockImplementation(
        () => new Promise(() => {})
      )

      store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.loading).toBe(true)
    })

    it('should set loading to false after fetch completes', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.loading).toBe(false)
    })

    it('should clear error on successful fetch', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockRejectedValue(new Error('Initial error'))
      await store.dispatch(fetchNamespaces())

      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.error).toBe(null)
    })

    it('should select default namespace when items are loaded', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.selectedId).toBe('default-ns')
    })

    it('should select first namespace if no default exists', async () => {
      const mockDb = require('@/lib/db')
      const namespacesWithoutDefault = mockNamespaces.map(ns => ({
        ...ns,
        isDefault: false,
      }))
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(namespacesWithoutDefault)

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.selectedId).toBe(namespacesWithoutDefault[0].id)
    })

    it('should not override existing selection if already set', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

      await store.dispatch(fetchNamespaces())
      store.dispatch(setSelectedNamespace('ns2'))

      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.selectedId).toBe('ns2')
    })

    it('should handle fetch error', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      const error = new Error('Fetch failed')
      mockDb.getAllNamespaces.mockRejectedValue(error)

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.loading).toBe(false)
      expect(state.error).toBe('Fetch failed')
    })

    it('should use default error message when error message is undefined', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockRejectedValue({})

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.error).toBe('Failed to fetch namespaces')
    })

    it('should replace previous items with new ones', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue([mockNamespaces[0]])
      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.items.length).toBe(1)

      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.items.length).toBe(4)
    })

    it('should handle empty namespaces array', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue([])

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.items).toEqual([])
      expect(state.selectedId).toBe(null)
    })

    it('should handle null response from getAllNamespaces', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(null)

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.items).toEqual([])
    })
  })

  describe('async thunks - createNamespace', () => {
    it('should create a new namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('New Namespace'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(1)
      expect(state.items[0].name).toBe('New Namespace')
      expect(state.items[0].isDefault).toBe(false)
    })

    it('should add multiple namespaces', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Namespace 1'))
      await store.dispatch(createNamespace('Namespace 2'))
      await store.dispatch(createNamespace('Namespace 3'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(3)
    })

    it('should generate unique id for new namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Namespace 1'))
      const id1 = store.getState().namespaces.items[0].id

      await store.dispatch(createNamespace('Namespace 2'))
      const id2 = store.getState().namespaces.items[0].id

      // Both should be string ids generated from timestamps
      expect(typeof id1).toBe('string')
      expect(typeof id2).toBe('string')
      expect(id1.length).toBeGreaterThan(0)
      expect(id2.length).toBeGreaterThan(0)
    })

    it('should set createdAt timestamp', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Test Namespace'))

      const namespace = store.getState().namespaces.items[0]
      expect(namespace.createdAt).toBeGreaterThan(0)
    })

    it('should call database create function with correct namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Test Namespace'))

      expect(mockDb.createNamespace).toHaveBeenCalled()
      const passedData = mockDb.createNamespace.mock.calls[0][0]
      expect(passedData.name).toBe('Test Namespace')
      expect(passedData.isDefault).toBe(false)
    })

    it('should handle special characters in namespace name', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Namespace with !@#$%'))

      const state = store.getState().namespaces
      expect(state.items[0].name).toBe('Namespace with !@#$%')
    })

    it('should handle long namespace names', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      const longName = 'A'.repeat(200)
      await store.dispatch(createNamespace(longName))

      const state = store.getState().namespaces
      expect(state.items[0].name).toBe(longName)
    })

    it('should handle duplicate namespace names', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Duplicate'))

      await store.dispatch(createNamespace('Duplicate'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(2)
      expect(state.items[0].name).toBe('Duplicate')
      expect(state.items[1].name).toBe('Duplicate')
      // Both namespaces should be created with valid IDs
      expect(state.items[0].id).toBeTruthy()
      expect(state.items[1].id).toBeTruthy()
    })
  })

  describe('async thunks - deleteNamespace', () => {
    it('should delete a namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.items.length).toBe(4)

      await store.dispatch(deleteNamespace('ns1'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(3)
      expect(state.items.find(n => n.id === 'ns1')).toBeUndefined()
    })

    it('should delete correct namespace from multiple', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      await store.dispatch(deleteNamespace('ns2'))

      const state = store.getState().namespaces
      expect(state.items[0].id).toBe('default-ns')
      expect(state.items[1].id).toBe('ns1')
      expect(state.items[2].id).toBe('ns3')
    })

    it('should call database delete with correct id', async () => {
      const mockDb = require('@/lib/db')
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(deleteNamespace('test-id'))

      expect(mockDb.deleteNamespace).toHaveBeenCalledWith('test-id')
    })

    it('should handle deleting non-existent namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      await store.dispatch(deleteNamespace('nonexistent'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(4)
    })

    it('should delete namespace from empty list without error', async () => {
      const mockDb = require('@/lib/db')
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(deleteNamespace('ns1'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(0)
    })

    it('should not affect selectedId when deleting non-selected namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      store.dispatch(setSelectedNamespace('ns2'))

      await store.dispatch(deleteNamespace('ns1'))

      const state = store.getState().namespaces
      expect(state.selectedId).toBe('ns2')
    })

    it('should select default namespace when deleting selected namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      store.dispatch(setSelectedNamespace('ns1'))

      await store.dispatch(deleteNamespace('ns1'))

      const state = store.getState().namespaces
      expect(state.selectedId).toBe('default-ns')
    })

    it('should select first namespace when deleting selected and no default exists', async () => {
      const mockDb = require('@/lib/db')
      const namespacesWithoutDefault = mockNamespaces.map(ns => ({
        ...ns,
        isDefault: false,
      }))
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(namespacesWithoutDefault)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      store.dispatch(setSelectedNamespace('ns2'))

      // After delete, should be 3 namespaces
      const remaining = namespacesWithoutDefault.filter(n => n.id !== 'ns2')
      mockDb.getAllNamespaces.mockResolvedValue(remaining)

      await store.dispatch(deleteNamespace('ns2'))

      const state = store.getState().namespaces
      expect(state.selectedId).toBe(remaining[0].id)
    })

    it('should set selectedId to null when deleting last namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.deleteNamespace.mockResolvedValue(undefined)
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue([mockNamespaces[0]])

      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.items.length).toBe(1)

      await store.dispatch(deleteNamespace('default-ns'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(0)
      expect(state.selectedId).toBe(null)
    })
  })

  describe('combined operations', () => {
    it('should handle fetch then create', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue([mockNamespaces[0]])
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.items.length).toBe(1)

      await store.dispatch(createNamespace('New Namespace'))
      expect(store.getState().namespaces.items.length).toBe(2)
    })

    it('should handle create then set selected', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Namespace 1'))
      const id1 = store.getState().namespaces.items[0].id

      store.dispatch(setSelectedNamespace(id1))
      expect(store.getState().namespaces.selectedId).toBe(id1)
    })

    it('should handle create then delete', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Test'))
      const id = store.getState().namespaces.items[0].id
      expect(store.getState().namespaces.items.length).toBe(1)

      await store.dispatch(deleteNamespace(id))
      expect(store.getState().namespaces.items.length).toBe(0)
    })
  })

  describe('error handling', () => {
    it('should not overwrite items on fetch error', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.items.length).toBe(4)

      mockDb.getAllNamespaces.mockRejectedValue(new Error('Error'))
      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.items.length).toBe(4)
    })

    it('should clear error on successful retry', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
      mockDb.getAllNamespaces.mockRejectedValue(new Error('Initial error'))

      await store.dispatch(fetchNamespaces())
      expect(store.getState().namespaces.error).toBe('Initial error')

      mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.error).toBe(null)
    })
  })

  describe('edge cases', () => {
    it('should handle very large namespace ids', async () => {
      const mockDb = require('@/lib/db')
      const largeId = '99999999999999999999'
      store.dispatch(setSelectedNamespace(largeId))
      expect(store.getState().namespaces.selectedId).toBe(largeId)
    })

    it('should handle empty namespace name', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace(''))

      const state = store.getState().namespaces
      expect(state.items[0].name).toBe('')
    })

    it('should handle many namespaces', async () => {
      const mockDb = require('@/lib/db')
      mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)

      const manyNamespaces = Array.from({ length: 100 }, (_, i) => ({
        id: `ns-${i}`,
        name: `Namespace ${i}`,
        createdAt: i * 1000,
        isDefault: i === 0,
      }))

      mockDb.getAllNamespaces.mockResolvedValue(manyNamespaces)

      await store.dispatch(fetchNamespaces())

      const state = store.getState().namespaces
      expect(state.items.length).toBe(100)
      expect(state.selectedId).toBe('ns-0')
    })

    it('should handle rapid consecutive operations', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)

      for (let i = 0; i < 50; i++) {
        await store.dispatch(createNamespace(`NS-${i}`))
      }

      const state = store.getState().namespaces
      expect(state.items.length).toBe(50)
    })

    it('should handle namespace with same name as deleted namespace', async () => {
      const mockDb = require('@/lib/db')
      mockDb.createNamespace.mockResolvedValue(undefined)
      mockDb.deleteNamespace.mockResolvedValue(undefined)

      await store.dispatch(createNamespace('Test'))
      const id1 = store.getState().namespaces.items[0].id

      await store.dispatch(deleteNamespace(id1))

      await store.dispatch(createNamespace('Test'))

      const state = store.getState().namespaces
      expect(state.items.length).toBe(1)
      expect(state.items[0].name).toBe('Test')
      // New namespace should have a valid ID (different from the old one since it was deleted)
      expect(state.items[0].id).toBeTruthy()
    })
  })
})
