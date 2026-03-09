import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Namespace } from '@/lib/types'
import {
  getAllNamespaces,
  createNamespace as createNamespaceDB,
  deleteNamespace as deleteNamespaceDB,
  updateNamespace as updateNamespaceDB,
  ensureDefaultNamespace,
} from '@/lib/db'

interface NamespacesState {
  items: Namespace[]
  selectedId: string | null
  loading: boolean
  error: string | null
}

const initialState: NamespacesState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
}

export const fetchNamespaces = createAsyncThunk(
  'namespaces/fetchAll',
  async () => {
    await ensureDefaultNamespace()
    return await getAllNamespaces()
  }
)

export const createNamespace = createAsyncThunk(
  'namespaces/create',
  async (name: string) => {
    const namespace: Namespace = {
      id: crypto.randomUUID(),
      name,
      createdAt: Date.now(),
      isDefault: false,
    }
    return await createNamespaceDB(namespace)
  }
)

export const updateNamespace = createAsyncThunk(
  'namespaces/update',
  async ({ id, name }: { id: string; name: string }) => {
    return await updateNamespaceDB(id, name)
  }
)

export const deleteNamespace = createAsyncThunk(
  'namespaces/delete',
  async (id: string) => {
    await deleteNamespaceDB(id)
    return id
  }
)

const namespacesSlice = createSlice({
  name: 'namespaces',
  initialState,
  reducers: {
    setSelectedNamespace: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNamespaces.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNamespaces.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload || []
        if (!state.selectedId && state.items.length > 0) {
          const defaultNamespace = state.items.find(n => n.isDefault)
          state.selectedId = defaultNamespace?.id || state.items[0].id
        }
      })
      .addCase(fetchNamespaces.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch namespaces'
      })
      .addCase(createNamespace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createNamespace.fulfilled, (state, action) => {
        state.loading = false
        state.items.push(action.payload)
      })
      .addCase(createNamespace.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create namespace'
      })
      .addCase(updateNamespace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateNamespace.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.items.findIndex(n => n.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(updateNamespace.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update namespace'
      })
      .addCase(deleteNamespace.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteNamespace.fulfilled, (state, action) => {
        state.loading = false
        state.items = state.items.filter(n => n.id !== action.payload)
        if (state.selectedId === action.payload) {
          const defaultNamespace = state.items.find(n => n.isDefault)
          state.selectedId = defaultNamespace?.id || state.items[0]?.id || null
        }
      })
      .addCase(deleteNamespace.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete namespace'
      })
  },
})

export const { setSelectedNamespace } = namespacesSlice.actions

export default namespacesSlice.reducer
