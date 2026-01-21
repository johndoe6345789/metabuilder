import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

export interface ComponentTree {
  id: string
  name: string
  description?: string
  root: ComponentTreeNode
  metadata?: Record<string, any>
  updatedAt: number
}

export interface ComponentTreeNode {
  id: string
  type: string
  props?: Record<string, any>
  children?: ComponentTreeNode[]
  bindings?: DataBinding[]
}

export interface DataBinding {
  property: string
  source: 'state' | 'props' | 'api' | 'computed'
  path: string
  transform?: string
}

interface ComponentTreesState {
  trees: ComponentTree[]
  activeTreeId: string | null
  loading: boolean
  error: string | null
}

const initialState: ComponentTreesState = {
  trees: [],
  activeTreeId: null,
  loading: false,
  error: null,
}

export const loadComponentTrees = createAsyncThunk(
  'componentTrees/loadTrees',
  async () => {
    try {
      const response = await fetch('/components.json')
      if (!response.ok) {
        return []
      }
      const data = await response.json()
      return data.componentTrees || []
    } catch (error) {
      console.error('Failed to load component trees:', error)
      return []
    }
  }
)

export const saveComponentTree = createAsyncThunk(
  'componentTrees/saveTree',
  async (tree: ComponentTree) => {
    await syncToFlask('componentTrees', tree.id, tree)
    return tree
  }
)

export const deleteComponentTree = createAsyncThunk(
  'componentTrees/deleteTree',
  async (treeId: string) => {
    await syncToFlask('componentTrees', treeId, null, 'delete')
    return treeId
  }
)

export const syncTreeFromFlask = createAsyncThunk(
  'componentTrees/syncFromFlask',
  async (treeId: string) => {
    const tree = await fetchFromFlask('componentTrees', treeId)
    return tree
  }
)

const componentTreesSlice = createSlice({
  name: 'componentTrees',
  initialState,
  reducers: {
    setActiveTree: (state, action: PayloadAction<string>) => {
      state.activeTreeId = action.payload
    },
    clearActiveTree: (state) => {
      state.activeTreeId = null
    },
    addTree: (state, action: PayloadAction<ComponentTree>) => {
      state.trees.push(action.payload)
    },
    updateTree: (state, action: PayloadAction<ComponentTree>) => {
      const index = state.trees.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.trees[index] = action.payload
      }
    },
    updateTreeNode: (state, action: PayloadAction<{ treeId: string; nodeId: string; updates: Partial<ComponentTreeNode> }>) => {
      const tree = state.trees.find(t => t.id === action.payload.treeId)
      if (tree) {
        const updateNode = (node: ComponentTreeNode): ComponentTreeNode => {
          if (node.id === action.payload.nodeId) {
            return { ...node, ...action.payload.updates }
          }
          if (node.children) {
            return {
              ...node,
              children: node.children.map(updateNode)
            }
          }
          return node
        }
        tree.root = updateNode(tree.root)
        tree.updatedAt = Date.now()
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadComponentTrees.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadComponentTrees.fulfilled, (state, action) => {
        state.loading = false
        state.trees = action.payload
      })
      .addCase(loadComponentTrees.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load component trees'
      })
      .addCase(saveComponentTree.fulfilled, (state, action) => {
        const index = state.trees.findIndex(t => t.id === action.payload.id)
        if (index !== -1) {
          state.trees[index] = action.payload
        } else {
          state.trees.push(action.payload)
        }
      })
      .addCase(deleteComponentTree.fulfilled, (state, action) => {
        state.trees = state.trees.filter(t => t.id !== action.payload)
        if (state.activeTreeId === action.payload) {
          state.activeTreeId = null
        }
      })
      .addCase(syncTreeFromFlask.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.trees.findIndex(t => t.id === action.payload.id)
          if (index !== -1) {
            state.trees[index] = action.payload
          } else {
            state.trees.push(action.payload)
          }
        }
      })
  },
})

export const { 
  setActiveTree, 
  clearActiveTree, 
  addTree, 
  updateTree,
  updateTreeNode 
} = componentTreesSlice.actions

export default componentTreesSlice.reducer
