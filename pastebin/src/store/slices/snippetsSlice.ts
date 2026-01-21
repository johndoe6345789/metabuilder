import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Snippet } from '@/lib/types'
import {
  getAllSnippets,
  createSnippet as createSnippetDB,
  updateSnippet as updateSnippetDB,
  deleteSnippet as deleteSnippetDB,
  getSnippetsByNamespace,
  bulkMoveSnippets as bulkMoveSnippetsDB,
  moveSnippetToNamespace,
} from '@/lib/db'

interface SnippetsState {
  items: Snippet[]
  loading: boolean
  error: string | null
  selectedIds: string[]
  selectionMode: boolean
}

const initialState: SnippetsState = {
  items: [],
  loading: false,
  error: null,
  selectedIds: [],
  selectionMode: false,
}

export const fetchAllSnippets = createAsyncThunk(
  'snippets/fetchAll',
  async () => {
    return await getAllSnippets()
  }
)

export const fetchSnippetsByNamespace = createAsyncThunk(
  'snippets/fetchByNamespace',
  async (namespaceId: string) => {
    return await getSnippetsByNamespace(namespaceId)
  }
)

export const createSnippet = createAsyncThunk(
  'snippets/create',
  async (snippetData: Omit<Snippet, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSnippet: Snippet = {
      ...snippetData,
      id: Date.now().toString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await createSnippetDB(newSnippet)
    return newSnippet
  }
)

export const updateSnippet = createAsyncThunk(
  'snippets/update',
  async (snippet: Snippet) => {
    const updatedSnippet = {
      ...snippet,
      updatedAt: Date.now(),
    }
    await updateSnippetDB(updatedSnippet)
    return updatedSnippet
  }
)

export const deleteSnippet = createAsyncThunk(
  'snippets/delete',
  async (id: string) => {
    await deleteSnippetDB(id)
    return id
  }
)

export const moveSnippet = createAsyncThunk(
  'snippets/move',
  async ({ snippetId, targetNamespaceId }: { snippetId: string, targetNamespaceId: string }) => {
    await moveSnippetToNamespace(snippetId, targetNamespaceId)
    return { snippetId, targetNamespaceId }
  }
)

export const bulkMoveSnippets = createAsyncThunk(
  'snippets/bulkMove',
  async ({ snippetIds, targetNamespaceId }: { snippetIds: string[], targetNamespaceId: string }) => {
    await bulkMoveSnippetsDB(snippetIds, targetNamespaceId)
    return { snippetIds, targetNamespaceId }
  }
)

const snippetsSlice = createSlice({
  name: 'snippets',
  initialState,
  reducers: {
    toggleSelectionMode: (state) => {
      state.selectionMode = !state.selectionMode
      if (!state.selectionMode) {
        state.selectedIds = []
      }
    },
    toggleSnippetSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedIds.indexOf(action.payload)
      if (index !== -1) {
        state.selectedIds.splice(index, 1)
      } else {
        state.selectedIds.push(action.payload)
      }
    },
    clearSelection: (state) => {
      state.selectedIds = []
    },
    selectAllSnippets: (state) => {
      state.selectedIds = state.items.map(s => s.id)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSnippets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllSnippets.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchAllSnippets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch snippets'
      })
      .addCase(fetchSnippetsByNamespace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSnippetsByNamespace.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchSnippetsByNamespace.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch snippets'
      })
      .addCase(createSnippet.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateSnippet.fulfilled, (state, action) => {
        const index = state.items.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(deleteSnippet.fulfilled, (state, action) => {
        state.items = state.items.filter(s => s.id !== action.payload)
      })
      .addCase(moveSnippet.fulfilled, (state, action) => {
        const { snippetId } = action.payload
        state.items = state.items.filter(s => s.id !== snippetId)
      })
      .addCase(bulkMoveSnippets.fulfilled, (state, action) => {
        const { snippetIds } = action.payload
        state.items = state.items.filter(s => !snippetIds.includes(s.id))
        state.selectedIds = []
        state.selectionMode = false
      })
  },
})

export const {
  toggleSelectionMode,
  toggleSnippetSelection,
  clearSelection,
  selectAllSnippets,
} = snippetsSlice.actions

export default snippetsSlice.reducer
