import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { syncToDBAL, fetchFromDBAL, deleteFromDBAL } from '@/store/middleware/dbalSync'

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

export const saveFile = createAsyncThunk(
  'files/saveFile',
  async (file: FileItem) => {
    await syncToDBAL('files', file.id, file)
    return file
  }
)

export const deleteFile = createAsyncThunk(
  'files/deleteFile',
  async (fileId: string) => {
    await deleteFromDBAL('files', fileId)
    return fileId
  }
)

export const syncFileFromDBAL = createAsyncThunk(
  'files/syncFromDBAL',
  async (fileId: string) => {
    return await fetchFromDBAL('files', fileId)
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
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.id !== action.payload)
      if (state.activeFileId === action.payload) {
        state.activeFileId = null
      }
    },
    setFiles: (state, action: PayloadAction<FileItem[]>) => {
      state.files = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(syncFileFromDBAL.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.files.findIndex(f => f.id === action.payload.id)
          if (index !== -1) {
            state.files[index] = action.payload
          } else {
            state.files.push(action.payload)
          }
        }
      })
      .addMatcher(
        (action) => action.type === 'dbal/syncFromDBALBulk/fulfilled',
        (state, action: any) => {
          if (action.payload?.data?.files) {
            state.files = action.payload.data.files
          }
        }
      )
  },
})

export const { setActiveFile, clearActiveFile, addFile, updateFile, removeFile, setFiles } = filesSlice.actions
export default filesSlice.reducer
