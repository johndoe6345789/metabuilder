import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

export interface FileItem {
  id: string
  name: string
  content: string
  language: string
  path: string
  updatedAt: number
}

interface FilesState {
  files: FileItem[]
  activeFileId: string | null
  loading: boolean
  error: string | null
}

const initialState: FilesState = {
  files: [],
  activeFileId: null,
  loading: false,
  error: null,
}

export const loadFiles = createAsyncThunk('files/loadFiles', async () => {
  const files = await db.getAll('files')
  return files as FileItem[]
})

export const saveFile = createAsyncThunk(
  'files/saveFile',
  async (file: FileItem) => {
    await db.put('files', file)
    await syncToFlask('files', file.id, file)
    return file
  }
)

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId: string) => {
    await db.delete('files', fileId)
    await syncToFlask('files', fileId, null, 'delete')
    return fileId
  }
)

export const syncFileFromFlask = createAsyncThunk(
  'files/syncFromFlask',
  async (fileId: string) => {
    const file = await fetchFromFlask('files', fileId)
    if (file) {
      await db.put('files', file)
    }
    return file
  }
)

const filesSlice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    setActiveFile: (state, action: PayloadAction<string>) => {
      state.activeFileId = action.payload
    },
    clearActiveFile: (state) => {
      state.activeFileId = null
    },
    addFile: (state, action: PayloadAction<FileItem>) => {
      state.files.push(action.payload)
    },
    updateFile: (state, action: PayloadAction<FileItem>) => {
      const index = state.files.findIndex(f => f.id === action.payload.id)
      if (index !== -1) {
        state.files[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload
      })
      .addCase(loadFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load files'
      })
      .addCase(saveFile.fulfilled, (state, action) => {
        const index = state.files.findIndex(f => f.id === action.payload.id)
        if (index !== -1) {
          state.files[index] = action.payload
        } else {
          state.files.push(action.payload)
        }
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f.id !== action.payload)
        if (state.activeFileId === action.payload) {
          state.activeFileId = null
        }
      })
      .addCase(syncFileFromFlask.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.files.findIndex(f => f.id === action.payload.id)
          if (index !== -1) {
            state.files[index] = action.payload
          } else {
            state.files.push(action.payload)
          }
        }
      })
  },
})

export const { setActiveFile, clearActiveFile, addFile, updateFile } = filesSlice.actions
export default filesSlice.reducer
