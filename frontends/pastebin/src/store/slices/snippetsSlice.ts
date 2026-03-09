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
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    return await createSnippetDB(newSnippet)
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
    patchSnippetLocal: (state, action: { payload: { id: string; fields: Partial<import('@/lib/types').Snippet> } }) => {
      const idx = state.items.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload.fields }
      }
    },
    addSnippetLocal: (state, action: { payload: import('@/lib/types').Snippet }) => {
      state.items.unshift(action.payload)
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
      .addCase(createSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSnippet.fulfilled, (state, action) => {
        state.loading = false
        state.items.unshift(action.payload)
      })
      .addCase(createSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Operation failed'
      })
      .addCase(updateSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateSnippet.fulfilled, (state, action) => {
        state.loading = false
        const index = state.items.findIndex(s => s.id === action.payload.id)
        if (index !== -1) {
          state.items[index] = action.payload
        }
      })
      .addCase(updateSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Operation failed'
      })
      .addCase(deleteSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteSnippet.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(s => s.id !== action.payload)
      })
      .addCase(deleteSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Operation failed'
      })
      .addCase(moveSnippet.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(moveSnippet.fulfilled, (state, action) => {
        state.loading = false
        const { snippetId, targetNamespaceId } = action.payload
        const item = state.items.find(s => s.id === snippetId)
        if (item) item.namespaceId = targetNamespaceId
      })
      .addCase(moveSnippet.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Operation failed'
      })
      .addCase(bulkMoveSnippets.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(bulkMoveSnippets.fulfilled, (state, action) => {
        state.loading = false
        const { snippetIds, targetNamespaceId } = action.payload
        state.items.forEach(s => {
          if (snippetIds.includes(s.id)) s.namespaceId = targetNamespaceId
        })
        state.selectedIds = []
        state.selectionMode = false
      })
      .addCase(bulkMoveSnippets.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Operation failed'
      })
  },
})

export const {
  toggleSelectionMode,
  toggleSnippetSelection,
  clearSelection,
  selectAllSnippets,
  patchSnippetLocal,
  addSnippetLocal,
} = snippetsSlice.actions

export default snippetsSlice.reducer
