import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  fetchFromDBAL: vi.fn().mockResolvedValue(null),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
  fetchAllFromDBAL: vi.fn().mockResolvedValue({}),
}))

import reducer, {
  addFile,
  updateFile,
  removeFile,
  setActiveFile,
  clearActiveFile,
  setFiles,
  type FileItem,
} from './filesSlice'

function makeFile(id: string, name = `file-${id}`): FileItem {
  return {
    id,
    name,
    content: `// ${name}`,
    language: 'typescript',
    path: `/src/${name}.ts`,
    updatedAt: Date.now(),
  }
}

describe('filesSlice reducer', () => {
  const empty = { files: [], activeFileId: null, loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('addFile', () => {
    it('appends a file', () => {
      const state = reducer(empty, addFile(makeFile('1')))
      expect(state.files).toHaveLength(1)
      expect(state.files[0].id).toBe('1')
    })
  })

  describe('updateFile', () => {
    it('updates an existing file by id', () => {
      let state = reducer(empty, addFile(makeFile('1', 'original')))
      const updated = makeFile('1', 'updated')
      state = reducer(state, updateFile(updated))
      expect(state.files[0].name).toBe('updated')
      expect(state.files).toHaveLength(1)
    })

    it('is a no-op when id not found', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      state = reducer(state, updateFile(makeFile('99', 'ghost')))
      expect(state.files).toHaveLength(1)
      expect(state.files[0].id).toBe('1')
    })
  })

  describe('removeFile', () => {
    it('removes a file by id', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      state = reducer(state, addFile(makeFile('2')))
      state = reducer(state, removeFile('1'))
      expect(state.files.map(f => f.id)).toEqual(['2'])
    })

    it('clears activeFileId when the active file is removed', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      state = reducer(state, setActiveFile('1'))
      state = reducer(state, removeFile('1'))
      expect(state.activeFileId).toBeNull()
    })

    it('does not clear activeFileId for a different file', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      state = reducer(state, addFile(makeFile('2')))
      state = reducer(state, setActiveFile('2'))
      state = reducer(state, removeFile('1'))
      expect(state.activeFileId).toBe('2')
    })
  })

  describe('setActiveFile / clearActiveFile', () => {
    it('sets the active file id', () => {
      const state = reducer(empty, setActiveFile('abc'))
      expect(state.activeFileId).toBe('abc')
    })

    it('clears the active file id', () => {
      let state = reducer(empty, setActiveFile('abc'))
      state = reducer(state, clearActiveFile())
      expect(state.activeFileId).toBeNull()
    })
  })

  describe('setFiles', () => {
    it('replaces all files', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      const newFiles = [makeFile('10'), makeFile('20')]
      state = reducer(state, setFiles(newFiles))
      expect(state.files).toHaveLength(2)
      expect(state.files[0].id).toBe('10')
    })
  })

  describe('dbal/syncFromDBALBulk/fulfilled matcher', () => {
    it('replaces files from bulk sync payload', () => {
      const bulkAction = {
        type: 'dbal/syncFromDBALBulk/fulfilled',
        payload: { data: { files: [makeFile('bulk-1')] } },
      }
      const state = reducer(empty, bulkAction)
      expect(state.files).toHaveLength(1)
      expect(state.files[0].id).toBe('bulk-1')
    })

    it('ignores bulk sync payload if no files key', () => {
      const bulkAction = {
        type: 'dbal/syncFromDBALBulk/fulfilled',
        payload: { data: {} },
      }
      const state = reducer(empty, bulkAction)
      expect(state.files).toHaveLength(0)
    })
  })

  describe('saveFile.fulfilled async action', () => {
    it('updates existing file on fulfilled', () => {
      let state = reducer(empty, addFile(makeFile('1', 'old')))
      const action = { type: 'files/saveFile/fulfilled', payload: makeFile('1', 'saved') }
      state = reducer(state, action)
      expect(state.files[0].name).toBe('saved')
      expect(state.files).toHaveLength(1)
    })

    it('adds new file if not present on fulfilled', () => {
      const action = { type: 'files/saveFile/fulfilled', payload: makeFile('new-file') }
      const state = reducer(empty, action)
      expect(state.files[0].id).toBe('new-file')
    })
  })

  describe('deleteFile.fulfilled async action', () => {
    it('removes file by id on fulfilled', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      state = reducer(state, addFile(makeFile('2')))
      const action = { type: 'files/deleteFile/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.files.map(f => f.id)).toEqual(['2'])
    })

    it('clears activeFileId if active file is deleted', () => {
      let state = reducer(empty, addFile(makeFile('1')))
      state = reducer(state, setActiveFile('1'))
      const action = { type: 'files/deleteFile/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.activeFileId).toBeNull()
    })
  })

  describe('syncFileFromDBAL.fulfilled async action', () => {
    it('updates existing file', () => {
      let state = reducer(empty, addFile(makeFile('1', 'before')))
      const action = { type: 'files/syncFromDBAL/fulfilled', payload: makeFile('1', 'synced') }
      state = reducer(state, action)
      expect(state.files[0].name).toBe('synced')
    })

    it('adds file if not existing', () => {
      const action = { type: 'files/syncFromDBAL/fulfilled', payload: makeFile('synced-id') }
      const state = reducer(empty, action)
      expect(state.files[0].id).toBe('synced-id')
    })

    it('is a no-op when payload is null', () => {
      const action = { type: 'files/syncFromDBAL/fulfilled', payload: null }
      const state = reducer(empty, action)
      expect(state.files).toHaveLength(0)
    })
  })
})
