import { configureStore } from '@reduxjs/toolkit'
import snippetsReducer, {
  fetchAllSnippets,
  fetchSnippetsByNamespace,
  createSnippet,
  updateSnippet,
  deleteSnippet,
  moveSnippet,
  bulkMoveSnippets,
  toggleSelectionMode,
  toggleSnippetSelection,
  clearSelection,
  selectAllSnippets,
} from './snippetsSlice'
import { Snippet } from '@/lib/types'

// Mock database functions
jest.mock('@/lib/db', () => ({
  getAllSnippets: jest.fn(),
  createSnippet: jest.fn(),
  updateSnippet: jest.fn(),
  deleteSnippet: jest.fn(),
  getSnippetsByNamespace: jest.fn(),
  bulkMoveSnippets: jest.fn(),
  moveSnippetToNamespace: jest.fn(),
}))

const mockSnippets: Snippet[] = [
  {
    id: '1',
    title: 'Test Snippet 1',
    description: 'Test',
    code: 'console.log("test")',
    language: 'javascript',
    category: 'test',
    createdAt: 1000,
    updatedAt: 1000,
    hasPreview: false,
    functionName: 'test',
    inputParameters: [],
    namespaceId: 'ns1',
    isTemplate: false,
  },
  {
    id: '2',
    title: 'Test Snippet 2',
    description: 'Test',
    code: 'console.log("test2")',
    language: 'javascript',
    category: 'test',
    createdAt: 2000,
    updatedAt: 2000,
    hasPreview: false,
    functionName: 'test2',
    inputParameters: [],
    namespaceId: 'ns1',
    isTemplate: false,
  },
]

describe('snippetsSlice', () => {
  let store: ReturnType<typeof configureStore>

  beforeEach(() => {
    store = configureStore({
      reducer: {
        snippets: snippetsReducer,
      },
    })
    jest.clearAllMocks()
  })

  describe('reducers', () => {
    it('should initialize with empty state', () => {
      const state = store.getState().snippets
      expect(state.items).toEqual([])
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
      expect(state.selectedIds).toEqual([])
      expect(state.selectionMode).toBe(false)
    })

    describe('toggleSelectionMode', () => {
      it('should toggle selection mode on', () => {
        store.dispatch(toggleSelectionMode())
        expect(store.getState().snippets.selectionMode).toBe(true)
      })

      it('should toggle selection mode off', () => {
        store.dispatch(toggleSelectionMode())
        store.dispatch(toggleSelectionMode())
        expect(store.getState().snippets.selectionMode).toBe(false)
      })

      it('should clear selected ids when turning off selection mode', () => {
        store.dispatch(toggleSelectionMode())
        store.dispatch(toggleSnippetSelection('1'))
        store.dispatch(toggleSnippetSelection('2'))
        expect(store.getState().snippets.selectedIds).toEqual(['1', '2'])

        store.dispatch(toggleSelectionMode())
        expect(store.getState().snippets.selectedIds).toEqual([])
      })
    })

    describe('toggleSnippetSelection', () => {
      it('should add snippet id to selected ids', () => {
        store.dispatch(toggleSnippetSelection('1'))
        expect(store.getState().snippets.selectedIds).toEqual(['1'])
      })

      it('should add multiple snippet ids', () => {
        store.dispatch(toggleSnippetSelection('1'))
        store.dispatch(toggleSnippetSelection('2'))
        expect(store.getState().snippets.selectedIds).toEqual(['1', '2'])
      })

      it('should remove snippet id when already selected', () => {
        store.dispatch(toggleSnippetSelection('1'))
        store.dispatch(toggleSnippetSelection('1'))
        expect(store.getState().snippets.selectedIds).toEqual([])
      })

      it('should handle toggling different snippet ids', () => {
        store.dispatch(toggleSnippetSelection('1'))
        store.dispatch(toggleSnippetSelection('2'))
        store.dispatch(toggleSnippetSelection('1'))
        expect(store.getState().snippets.selectedIds).toEqual(['2'])
      })
    })

    describe('clearSelection', () => {
      it('should clear all selected ids', () => {
        store.dispatch(toggleSnippetSelection('1'))
        store.dispatch(toggleSnippetSelection('2'))
        store.dispatch(clearSelection())
        expect(store.getState().snippets.selectedIds).toEqual([])
      })

      it('should handle clearing empty selection', () => {
        store.dispatch(clearSelection())
        expect(store.getState().snippets.selectedIds).toEqual([])
      })
    })

    describe('selectAllSnippets', () => {
      it('should select all snippet ids', async () => {
        const { getState, dispatch } = store
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)

        await dispatch(fetchAllSnippets())
        dispatch(selectAllSnippets())

        expect(getState().snippets.selectedIds).toEqual(['1', '2'])
      })

      it('should handle selecting from empty items', () => {
        store.dispatch(selectAllSnippets())
        expect(store.getState().snippets.selectedIds).toEqual([])
      })
    })
  })

  describe('async thunks', () => {
    describe('fetchAllSnippets', () => {
      it('should fetch all snippets successfully', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)

        await store.dispatch(fetchAllSnippets())

        const state = store.getState().snippets
        expect(state.items).toEqual(mockSnippets)
        expect(state.loading).toBe(false)
        expect(state.error).toBeNull()
      })

      it('should handle fetch error', async () => {
        const mockDb = require('@/lib/db')
        const error = new Error('Fetch failed')
        mockDb.getAllSnippets.mockRejectedValue(error)

        await store.dispatch(fetchAllSnippets())

        const state = store.getState().snippets
        expect(state.loading).toBe(false)
        expect(state.error).toBeTruthy()
      })

      it('should use default error message when error message is undefined', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockRejectedValue({})

        await store.dispatch(fetchAllSnippets())

        const state = store.getState().snippets
        expect(state.error).toBe('Failed to fetch snippets')
      })

      it('should set loading to true initially', () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockImplementation(
          () => new Promise(() => {})
        )

        store.dispatch(fetchAllSnippets())
        expect(store.getState().snippets.loading).toBe(true)
      })
    })

    describe('fetchSnippetsByNamespace', () => {
      it('should fetch snippets by namespace successfully', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getSnippetsByNamespace.mockResolvedValue([mockSnippets[0]])

        await store.dispatch(fetchSnippetsByNamespace('ns1'))

        const state = store.getState().snippets
        expect(state.items).toEqual([mockSnippets[0]])
        expect(state.loading).toBe(false)
      })

      it('should handle fetch by namespace error', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getSnippetsByNamespace.mockRejectedValue(
          new Error('Failed')
        )

        await store.dispatch(fetchSnippetsByNamespace('ns1'))

        const state = store.getState().snippets
        expect(state.error).toBeTruthy()
      })

      it('should use default error message for namespace fetch when error message is undefined', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getSnippetsByNamespace.mockRejectedValue({})

        await store.dispatch(fetchSnippetsByNamespace('ns1'))

        const state = store.getState().snippets
        expect(state.error).toBe('Failed to fetch snippets')
      })
    })

    describe('createSnippet', () => {
      it('should create a new snippet', async () => {
        const mockDb = require('@/lib/db')
        mockDb.createSnippet.mockResolvedValue(undefined)

        const newSnippetData = {
          title: 'New Snippet',
          description: 'Test',
          code: 'console.log("new")',
          language: 'javascript' as const,
          category: 'test',
          hasPreview: false,
          functionName: 'test',
          inputParameters: [],
          namespaceId: 'ns1',
          isTemplate: false,
        }

        await store.dispatch(createSnippet(newSnippetData))

        const state = store.getState().snippets
        expect(state.items.length).toBe(1)
        expect(state.items[0].title).toBe('New Snippet')
      })

      it('should add new snippet at the beginning', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)
        mockDb.createSnippet.mockResolvedValue(undefined)

        await store.dispatch(fetchAllSnippets())
        expect(store.getState().snippets.items.length).toBe(2)

        const newSnippetData = {
          title: 'New Snippet',
          description: 'Test',
          code: 'console.log("new")',
          language: 'javascript' as const,
          category: 'test',
          hasPreview: false,
          functionName: 'test',
          inputParameters: [],
          namespaceId: 'ns1',
          isTemplate: false,
        }

        await store.dispatch(createSnippet(newSnippetData))

        const state = store.getState().snippets
        expect(state.items.length).toBe(3)
        expect(state.items[0].title).toBe('New Snippet')
      })
    })

    describe('updateSnippet', () => {
      it('should update an existing snippet', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)
        mockDb.updateSnippet.mockResolvedValue(undefined)

        await store.dispatch(fetchAllSnippets())

        const updatedSnippet = {
          ...mockSnippets[0],
          title: 'Updated Title',
        }

        await store.dispatch(updateSnippet(updatedSnippet))

        const state = store.getState().snippets
        const found = state.items.find(s => s.id === '1')
        expect(found?.title).toBe('Updated Title')
      })

      it('should handle update of non-existent snippet', async () => {
        const mockDb = require('@/lib/db')
        mockDb.updateSnippet.mockResolvedValue(undefined)

        const newSnippet: Snippet = {
          ...mockSnippets[0],
          id: 'nonexistent',
          title: 'New Title',
        }

        await store.dispatch(updateSnippet(newSnippet))

        const state = store.getState().snippets
        expect(state.items.length).toBe(0)
      })
    })

    describe('deleteSnippet', () => {
      it('should delete a snippet', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)
        mockDb.deleteSnippet.mockResolvedValue(undefined)

        await store.dispatch(fetchAllSnippets())
        expect(store.getState().snippets.items.length).toBe(2)

        await store.dispatch(deleteSnippet('1'))

        const state = store.getState().snippets
        expect(state.items.length).toBe(1)
        expect(state.items[0].id).toBe('2')
      })

      it('should handle deleting non-existent snippet', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)
        mockDb.deleteSnippet.mockResolvedValue(undefined)

        await store.dispatch(fetchAllSnippets())
        await store.dispatch(deleteSnippet('nonexistent'))

        const state = store.getState().snippets
        expect(state.items.length).toBe(2)
      })
    })

    describe('moveSnippet', () => {
      it('should move a snippet to a new namespace', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)
        mockDb.moveSnippetToNamespace.mockResolvedValue(undefined)

        await store.dispatch(fetchAllSnippets())
        expect(store.getState().snippets.items.length).toBe(2)

        await store.dispatch(
          moveSnippet({ snippetId: '1', targetNamespaceId: 'ns2' })
        )

        const state = store.getState().snippets
        expect(state.items.length).toBe(1)
        expect(state.items[0].id).toBe('2')
      })
    })

    describe('bulkMoveSnippets', () => {
      it('should bulk move multiple snippets', async () => {
        const mockDb = require('@/lib/db')
        mockDb.getAllSnippets.mockResolvedValue(mockSnippets)
        mockDb.bulkMoveSnippets.mockResolvedValue(undefined)

        await store.dispatch(fetchAllSnippets())

        store.dispatch(toggleSnippetSelection('1'))
        store.dispatch(toggleSnippetSelection('2'))

        await store.dispatch(
          bulkMoveSnippets({
            snippetIds: ['1', '2'],
            targetNamespaceId: 'ns2',
          })
        )

        const state = store.getState().snippets
        expect(state.items.length).toBe(0)
        expect(state.selectedIds).toEqual([])
        expect(state.selectionMode).toBe(false)
      })

      it('should handle bulk move with empty snippets list', async () => {
        const mockDb = require('@/lib/db')
        mockDb.bulkMoveSnippets.mockResolvedValue(undefined)

        await store.dispatch(
          bulkMoveSnippets({
            snippetIds: ['1', '2'],
            targetNamespaceId: 'ns2',
          })
        )

        const state = store.getState().snippets
        expect(state.items.length).toBe(0)
      })
    })
  })
})
