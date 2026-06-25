/**
 * Tests for Redux store configuration
 */

function makeSlice(name: string) {
  return { reducer: (s = {}) => s, actions: {}, name }
}

jest.mock('@metabuilder/redux-slices', () => ({
  workflowSlice: { reducer: (s = {}) => s, actions: {}, name: 'workflow' },
  workflowsSlice: { reducer: (s = {}) => s, actions: {}, name: 'workflows' },
  canvasItemsSlice: { reducer: (s = {}) => s, actions: {}, name: 'canvasItems' },
  collaborationSlice: { reducer: (s = {}) => s, actions: {}, name: 'collaboration' },
  authSlice: { reducer: (s = {}) => s, actions: {}, name: 'auth' },
  realtimeSlice: { reducer: (s = {}) => s, actions: {}, name: 'realtime' },
  connectionSlice: { reducer: (s = {}) => s, actions: {}, name: 'connection' },
  nodesSlice: { reducer: (s = {}) => s, actions: {}, name: 'nodes' },
  uiSlice: { reducer: (s = {}) => s, actions: {}, name: 'ui' },
  editorSlice: { reducer: (s = {}) => s, actions: {}, name: 'editor' },
  workspaceSlice: { reducer: (s = {}) => s, actions: {}, name: 'workspace' },
  projectSlice: { reducer: (s = {}) => s, actions: {}, name: 'project' },
  canvasSlice: { reducer: (s = {}) => s, actions: {}, name: 'canvas' },
}))

jest.mock('@metabuilder/redux-middleware', () => ({
  authMiddleware: () => (next: any) => (action: any) => next(action),
  apiMiddleware: () => (next: any) => (action: any) => next(action),
  initAuthInterceptor: jest.fn(),
}))

jest.mock('@metabuilder/redux-persist', () => ({
  createPersistedStore: jest.fn(() => ({
    store: {
      getState: jest.fn(() => ({})),
      dispatch: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
    },
    persistor: { persist: jest.fn(), purge: jest.fn() },
  })),
}))

// Import after mocks
import store, { store as namedStore, persistor } from '../store'
import type { RootState, AppDispatch } from '../store'

describe('Redux Store', () => {
  it('should export a store instance', () => {
    expect(store).toBeDefined()
  })

  it('should export named store', () => {
    expect(namedStore).toBeDefined()
  })

  it('should export persistor', () => {
    expect(persistor).toBeDefined()
  })

  it('store should have getState method', () => {
    expect(typeof store.getState).toBe('function')
  })

  it('store should have dispatch method', () => {
    expect(typeof store.dispatch).toBe('function')
  })

  it('store should have subscribe method', () => {
    expect(typeof store.subscribe).toBe('function')
  })

  it('should have called createPersistedStore with correct reducers', () => {
    const { createPersistedStore } = require('@metabuilder/redux-persist')
    expect(createPersistedStore).toHaveBeenCalledWith(
      expect.objectContaining({
        reducers: expect.objectContaining({
          workflow: expect.any(Function),
          workflows: expect.any(Function),
          editor: expect.any(Function),
        }),
      })
    )
  })

  it('should have called initAuthInterceptor', () => {
    const { initAuthInterceptor } = require('@metabuilder/redux-middleware')
    expect(initAuthInterceptor).toHaveBeenCalled()
  })
})
