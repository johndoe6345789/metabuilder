import { configureStore } from '@reduxjs/toolkit'
import namespacesReducer, {
  fetchNamespaces,
  createNamespace,
  deleteNamespace,
  setSelectedNamespace,
} from '@/store/slices/namespacesSlice'
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
    id: 'ns-1',
    name: 'Personal',
    createdAt: 2000,
    isDefault: false,
  },
  {
    id: 'ns-2',
    name: 'Work',
    createdAt: 3000,
    isDefault: false,
  },
]

const createTestStore = () => configureStore({
  reducer: { namespaces: namespacesReducer },
})
type TestStore = ReturnType<typeof createTestStore>

describe('namespacesSlice', () => {
  let store: TestStore

  beforeEach(() => {
    store = createTestStore()
    jest.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with empty state', () => {
      const state = store.getState().namespaces
      expect(state.items).toEqual([])
      expect(state.selectedId).toBeNull()
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })
  })

  describe('reducers', () => {
    describe('setSelectedNamespace', () => {
      it('should set selected namespace id', () => {
        store.dispatch(setSelectedNamespace('ns-1'))
        expect(store.getState().namespaces.selectedId).toBe('ns-1')
      })

      it('should update selected namespace to different id', () => {
        store.dispatch(setSelectedNamespace('ns-1'))
        store.dispatch(setSelectedNamespace('ns-2'))
        expect(store.getState().namespaces.selectedId).toBe('ns-2')
      })

      it('should allow setting empty string as selected id', () => {
        store.dispatch(setSelectedNamespace('ns-1'))
        store.dispatch(setSelectedNamespace(''))
        expect(store.getState().namespaces.selectedId).toBe('')
      })
    })
  })

  describe('async thunks', () => {
    describe('fetchNamespaces', () => {
      it('should fetch namespaces successfully', async () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.items).toEqual(mockNamespaces)
        expect(state.loading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should set loading to true while fetching', () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockReturnValue(
          new Promise(() => {})
        )
        mockDb.getAllNamespaces.mockReturnValue(new Promise(() => {}))

        store.dispatch(fetchNamespaces())

        expect(store.getState().namespaces.loading).toBe(true)
      })

      it('should select default namespace when selectedId is null and items available', async () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.selectedId).toBe('default-ns')
      })

      it('should select first namespace when no default exists', async () => {
        const mockDb = require('@/lib/db')
        const namespacesWithoutDefault = [
          { ...mockNamespaces[1] },
          { ...mockNamespaces[2] },
        ]
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockResolvedValue(namespacesWithoutDefault)

        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.selectedId).toBe('ns-1')
      })

      it('should not change selectedId if already set', async () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

        store.dispatch(setSelectedNamespace('ns-2'))
        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.selectedId).toBe('ns-2')
      })

      it('should handle fetch error', async () => {
        const mockDb = require('@/lib/db')
        const error = new Error('Failed to fetch namespaces')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockRejectedValue(error)

        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.loading).toBe(false)
        expect(state.error).toContain('Failed to fetch namespaces')
      })

      it('should use default error message when error lacks message', async () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockRejectedValue({})

        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.error).toBe('Failed to fetch namespaces')
      })

      it('should call ensureDefaultNamespace before fetching all', async () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)

        await store.dispatch(fetchNamespaces())

        expect(mockDb.ensureDefaultNamespace).toHaveBeenCalledTimes(1)
      })

      it('should handle empty namespaces list', async () => {
        const mockDb = require('@/lib/db')
        mockDb.ensureDefaultNamespace.mockResolvedValue(undefined)
        mockDb.getAllNamespaces.mockResolvedValue([])

        await store.dispatch(fetchNamespaces())

        const state = store.getState().namespaces
        expect(state.items).toEqual([])
        expect(state.selectedId).toBeNull()
      })
    })

    describe('createNamespace', () => {
      it('should create a new namespace', async () => {
        const mockDb = require('@/lib/db')
        mockDb.createNamespace.mockResolvedValue(undefined)

        const namespaceName = 'New Namespace'
        await store.dispatch(createNamespace(namespaceName))

        const state = store.getState().namespaces
        expect(state.items.length).toBe(1)
        expect(state.items[0].name).toBe(namespaceName)
        expect(state.items[0].isDefault).toBe(false)
      })

      it('should create namespace with generated id and timestamp', async () => {
        const mockDb = require('@/lib/db')
        mockDb.createNamespace.mockResolvedValue(undefined)

        const beforeCreate = Date.now()
        await store.dispatch(createNamespace('Test'))
        const afterCreate = Date.now()

        const state = store.getState().namespaces
        const created = state.items[0]
        expect(created.id).toBeDefined()
        expect(typeof created.id).toBe('string')
        expect(created.createdAt).toBeGreaterThanOrEqual(beforeCreate)
        expect(created.createdAt).toBeLessThanOrEqual(afterCreate + 100)
      })

      it('should add namespace to items list', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.createNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        expect(store.getState().namespaces.items.length).toBe(3)

        await store.dispatch(createNamespace('Added'))

        const state = store.getState().namespaces
        expect(state.items.length).toBe(4)
        expect(state.items[3].name).toBe('Added')
      })

      it('should call database createNamespace function', async () => {
        const mockDb = require('@/lib/db')
        mockDb.createNamespace.mockResolvedValue(undefined)

        const namespaceName = 'Database Test'
        await store.dispatch(createNamespace(namespaceName))

        expect(mockDb.createNamespace).toHaveBeenCalledTimes(1)
        const callArg = mockDb.createNamespace.mock.calls[0][0]
        expect(callArg.name).toBe(namespaceName)
      })
    })

    describe('deleteNamespace', () => {
      it('should delete a namespace by id', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        expect(store.getState().namespaces.items.length).toBe(3)

        await store.dispatch(deleteNamespace('ns-1'))

        const state = store.getState().namespaces
        expect(state.items.length).toBe(2)
        expect(state.items.find(n => n.id === 'ns-1')).toBeUndefined()
      })

      it('should update selected namespace when deleting currently selected', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        store.dispatch(setSelectedNamespace('ns-1'))
        expect(store.getState().namespaces.selectedId).toBe('ns-1')

        await store.dispatch(deleteNamespace('ns-1'))

        const state = store.getState().namespaces
        expect(state.selectedId).not.toBe('ns-1')
      })

      it('should select default namespace when deleting selected and default exists', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        store.dispatch(setSelectedNamespace('ns-1'))

        await store.dispatch(deleteNamespace('ns-1'))

        const state = store.getState().namespaces
        expect(state.selectedId).toBe('default-ns')
      })

      it('should select first namespace when deleting selected and no default', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        store.dispatch(setSelectedNamespace('default-ns'))

        await store.dispatch(deleteNamespace('default-ns'))

        const state = store.getState().namespaces
        expect(state.selectedId).toBe('ns-1')
      })

      it('should set selectedId to null when deleting last namespace', async () => {
        const mockDb = require('@/lib/db')
        const singleNamespace = [mockNamespaces[0]]
        mockDb.getAllNamespaces.mockResolvedValue(singleNamespace)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())

        await store.dispatch(deleteNamespace('default-ns'))

        const state = store.getState().namespaces
        expect(state.items.length).toBe(0)
        expect(state.selectedId).toBeNull()
      })

      it('should not change selectedId when deleting non-selected namespace', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        store.dispatch(setSelectedNamespace('ns-2'))

        await store.dispatch(deleteNamespace('ns-1'))

        const state = store.getState().namespaces
        expect(state.selectedId).toBe('ns-2')
      })

      it('should call database deleteNamespace function', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllNamespaces.mockResolvedValue(mockNamespaces)
        mockDb.deleteNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchNamespaces())
        await store.dispatch(deleteNamespace('ns-1'))

        expect(mockDb.deleteNamespace).toHaveBeenCalledWith('ns-1')
      })
    })
  })
})
