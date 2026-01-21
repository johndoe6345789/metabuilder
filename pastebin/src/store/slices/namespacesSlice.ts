import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Namespace } from '@/lib/types'
import {
  getAllNamespaces,
  createNamespace as createNamespaceDB,
  deleteNamespace as deleteNamespaceDB,
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
      id: Date.now().toString(),
      name,
      createdAt: Date.now(),
      isDefault: false,
    }
    await createNamespaceDB(namespace)
    return namespace
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
      .addCase(createNamespace.fulfilled, (state, action) => {
        state.items.push(action.payload)
      })
      .addCase(deleteNamespace.fulfilled, (state, action) => {
        state.items = state.items.filter(n => n.id !== action.payload)
        if (state.selectedId === action.payload) {
          const defaultNamespace = state.items.find(n => n.isDefault)
          state.selectedId = defaultNamespace?.id || state.items[0]?.id || null
        }
      })
  },
})

export const { setSelectedNamespace } = namespacesSlice.actions

export default namespacesSlice.reducer
