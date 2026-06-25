import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  fetchFromDBAL: vi.fn().mockResolvedValue(null),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
}))

import reducer, {
  setCurrentProject,
  clearCurrentProject,
  updateProjectMetadata,
  markSynced,
  addProject,
  setProjects,
  type Project,
} from './projectSlice'

function makeProject(id: string, name = `Project ${id}`): Project {
  return { id, name, createdAt: 1000, updatedAt: 1000 }
}

describe('projectSlice reducer', () => {
  const empty = {
    currentProject: null,
    projects: [],
    loading: false,
    error: null,
    lastSyncedAt: null,
  }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('setCurrentProject', () => {
    it('sets the current project', () => {
      const state = reducer(empty, setCurrentProject(makeProject('1')))
      expect(state.currentProject?.id).toBe('1')
    })
  })

  describe('clearCurrentProject', () => {
    it('clears the current project', () => {
      let state = reducer(empty, setCurrentProject(makeProject('1')))
      state = reducer(state, clearCurrentProject())
      expect(state.currentProject).toBeNull()
    })
  })

  describe('updateProjectMetadata', () => {
    it('merges partial metadata into current project', () => {
      let state = reducer(empty, setCurrentProject(makeProject('1', 'Old Name')))
      state = reducer(state, updateProjectMetadata({ name: 'New Name' }))
      expect(state.currentProject?.name).toBe('New Name')
    })

    it('updates updatedAt', () => {
      const before = Date.now()
      let state = reducer(empty, setCurrentProject(makeProject('1')))
      state = reducer(state, updateProjectMetadata({ name: 'Updated' }))
      expect(state.currentProject!.updatedAt).toBeGreaterThanOrEqual(before)
    })

    it('is a no-op when no current project', () => {
      const state = reducer(empty, updateProjectMetadata({ name: 'Foo' }))
      expect(state.currentProject).toBeNull()
    })
  })

  describe('markSynced', () => {
    it('sets lastSyncedAt to a recent timestamp', () => {
      const before = Date.now()
      const state = reducer(empty, markSynced())
      expect(state.lastSyncedAt).toBeGreaterThanOrEqual(before)
    })
  })

  describe('addProject', () => {
    it('appends a project', () => {
      const state = reducer(empty, addProject(makeProject('1')))
      expect(state.projects).toHaveLength(1)
    })
  })

  describe('setProjects', () => {
    it('replaces all projects', () => {
      let state = reducer(empty, addProject(makeProject('1')))
      state = reducer(state, setProjects([makeProject('a'), makeProject('b')]))
      expect(state.projects).toHaveLength(2)
      expect(state.projects[0].id).toBe('a')
    })
  })

  describe('createProject.fulfilled async action', () => {
    it('adds project to list and sets as current on fulfilled', () => {
      const project = makeProject('new-1', 'New')
      const action = { type: 'project/createProject/fulfilled', payload: project }
      const state = reducer(empty, action)
      expect(state.projects).toHaveLength(1)
      expect(state.currentProject?.id).toBe('new-1')
    })
  })

  describe('saveProject.fulfilled async action', () => {
    it('updates project in list and sets lastSyncedAt', () => {
      let state = reducer(empty, addProject(makeProject('1', 'Before')))
      const action = {
        type: 'project/saveProject/fulfilled',
        payload: makeProject('1', 'After'),
      }
      state = reducer(state, action)
      expect(state.projects[0].name).toBe('After')
      expect(state.lastSyncedAt).toBeGreaterThan(0)
    })

    it('also updates currentProject if it matches', () => {
      let state = reducer(empty, setCurrentProject(makeProject('1', 'Before')))
      state = reducer(state, addProject(makeProject('1', 'Before')))
      const action = {
        type: 'project/saveProject/fulfilled',
        payload: makeProject('1', 'After'),
      }
      state = reducer(state, action)
      expect(state.currentProject?.name).toBe('After')
    })

    it('does not update currentProject if id differs', () => {
      let state = reducer(empty, setCurrentProject(makeProject('2', 'Keep')))
      state = reducer(state, addProject(makeProject('1', 'Before')))
      const action = {
        type: 'project/saveProject/fulfilled',
        payload: makeProject('1', 'After'),
      }
      state = reducer(state, action)
      expect(state.currentProject?.name).toBe('Keep')
    })

    it('does not crash when project not in list', () => {
      let state = reducer(empty, setCurrentProject(makeProject('1')))
      const action = {
        type: 'project/saveProject/fulfilled',
        payload: makeProject('999', 'Ghost'),
      }
      state = reducer(state, action)
      expect(state.projects).toHaveLength(0)
    })
  })

  describe('deleteProject.fulfilled async action', () => {
    it('removes project from list', () => {
      let state = reducer(empty, addProject(makeProject('1')))
      state = reducer(state, addProject(makeProject('2')))
      const action = { type: 'project/deleteProject/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.projects.map(p => p.id)).toEqual(['2'])
    })

    it('clears currentProject if deleted', () => {
      let state = reducer(empty, setCurrentProject(makeProject('1')))
      const action = { type: 'project/deleteProject/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.currentProject).toBeNull()
    })

    it('preserves currentProject if a different project is deleted', () => {
      let state = reducer(empty, setCurrentProject(makeProject('2')))
      state = reducer(state, addProject(makeProject('1')))
      state = reducer(state, addProject(makeProject('2')))
      const action = { type: 'project/deleteProject/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.currentProject?.id).toBe('2')
    })
  })

  describe('syncProjectFromDBAL.fulfilled async action', () => {
    it('adds project if not existing', () => {
      const project = makeProject('sync-1')
      const action = { type: 'project/syncFromDBAL/fulfilled', payload: project }
      const state = reducer(empty, action)
      expect(state.projects[0].id).toBe('sync-1')
      expect(state.lastSyncedAt).toBeGreaterThan(0)
    })

    it('updates project if existing', () => {
      let state = reducer(empty, addProject(makeProject('1', 'Old')))
      const action = {
        type: 'project/syncFromDBAL/fulfilled',
        payload: makeProject('1', 'Synced'),
      }
      state = reducer(state, action)
      expect(state.projects[0].name).toBe('Synced')
    })

    it('also updates currentProject if id matches', () => {
      let state = reducer(empty, setCurrentProject(makeProject('1', 'Old')))
      state = reducer(state, addProject(makeProject('1', 'Old')))
      const action = {
        type: 'project/syncFromDBAL/fulfilled',
        payload: makeProject('1', 'Synced'),
      }
      state = reducer(state, action)
      expect(state.currentProject?.name).toBe('Synced')
    })

    it('is a no-op when payload is null', () => {
      const action = { type: 'project/syncFromDBAL/fulfilled', payload: null }
      const state = reducer(empty, action)
      expect(state.projects).toHaveLength(0)
      expect(state.lastSyncedAt).toBeGreaterThan(0)
    })
  })
})
