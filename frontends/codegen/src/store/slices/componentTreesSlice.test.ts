import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
  fetchFromDBAL: vi.fn().mockResolvedValue(null),
  deleteFromDBAL: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/config/app-config', () => ({
  BASE_PATH: '/codegen',
}))

import reducer, {
  addTree,
  updateTree,
  updateTreeNode,
  setActiveTree,
  clearActiveTree,
  type ComponentTree,
  type ComponentTreeNode,
} from './componentTreesSlice'

function makeNode(id: string): ComponentTreeNode {
  return { id, type: 'div', props: {}, children: [] }
}

function makeTree(id: string, name = `Tree ${id}`): ComponentTree {
  return {
    id,
    name,
    root: makeNode('root'),
    updatedAt: Date.now(),
  }
}

describe('componentTreesSlice reducer', () => {
  const empty = { trees: [], activeTreeId: null, loading: false, error: null }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('addTree', () => {
    it('appends a tree', () => {
      const state = reducer(empty, addTree(makeTree('1')))
      expect(state.trees).toHaveLength(1)
      expect(state.trees[0].id).toBe('1')
    })
  })

  describe('updateTree', () => {
    it('updates an existing tree', () => {
      let state = reducer(empty, addTree(makeTree('1', 'Old')))
      state = reducer(state, updateTree(makeTree('1', 'New')))
      expect(state.trees[0].name).toBe('New')
      expect(state.trees).toHaveLength(1)
    })

    it('is a no-op for unknown id', () => {
      let state = reducer(empty, addTree(makeTree('1')))
      state = reducer(state, updateTree(makeTree('999')))
      expect(state.trees).toHaveLength(1)
    })
  })

  describe('setActiveTree / clearActiveTree', () => {
    it('sets active tree id', () => {
      const state = reducer(empty, setActiveTree('abc'))
      expect(state.activeTreeId).toBe('abc')
    })

    it('clears active tree id', () => {
      let state = reducer(empty, setActiveTree('abc'))
      state = reducer(state, clearActiveTree())
      expect(state.activeTreeId).toBeNull()
    })
  })

  describe('loadComponentTrees async actions', () => {
    it('sets loading=true on pending', () => {
      const action = { type: 'componentTrees/loadTrees/pending' }
      const state = reducer(empty, action)
      expect(state.loading).toBe(true)
      expect(state.error).toBeNull()
    })

    it('replaces trees and sets loading=false on fulfilled', () => {
      const trees = [makeTree('t1'), makeTree('t2')]
      const action = { type: 'componentTrees/loadTrees/fulfilled', payload: trees }
      const state = reducer({ ...empty, loading: true }, action)
      expect(state.loading).toBe(false)
      expect(state.trees).toHaveLength(2)
    })

    it('sets error on rejected', () => {
      const action = {
        type: 'componentTrees/loadTrees/rejected',
        error: { message: 'load failed' },
      }
      const state = reducer({ ...empty, loading: true }, action)
      expect(state.loading).toBe(false)
      expect(state.error).toBe('load failed')
    })
  })

  describe('saveComponentTree.fulfilled', () => {
    it('adds new tree if not existing', () => {
      const action = {
        type: 'componentTrees/saveTree/fulfilled',
        payload: makeTree('new'),
      }
      const state = reducer(empty, action)
      expect(state.trees[0].id).toBe('new')
    })

    it('updates existing tree', () => {
      let state = reducer(empty, addTree(makeTree('1', 'Old')))
      const action = {
        type: 'componentTrees/saveTree/fulfilled',
        payload: makeTree('1', 'Updated'),
      }
      state = reducer(state, action)
      expect(state.trees[0].name).toBe('Updated')
      expect(state.trees).toHaveLength(1)
    })
  })

  describe('deleteComponentTree.fulfilled', () => {
    it('removes tree by id', () => {
      let state = reducer(empty, addTree(makeTree('1')))
      state = reducer(state, addTree(makeTree('2')))
      const action = { type: 'componentTrees/deleteTree/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.trees.map(t => t.id)).toEqual(['2'])
    })

    it('clears activeTreeId when deleted', () => {
      let state = reducer(empty, addTree(makeTree('1')))
      state = reducer(state, setActiveTree('1'))
      const action = { type: 'componentTrees/deleteTree/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.activeTreeId).toBeNull()
    })

    it('preserves activeTreeId when a different tree is deleted', () => {
      let state = reducer(empty, addTree(makeTree('1')))
      state = reducer(state, addTree(makeTree('2')))
      state = reducer(state, setActiveTree('2'))
      const action = { type: 'componentTrees/deleteTree/fulfilled', payload: '1' }
      state = reducer(state, action)
      expect(state.activeTreeId).toBe('2')
    })
  })

  describe('updateTreeNode', () => {
    it('updates a node by id in the root tree', () => {
      const tree: ComponentTree = {
        id: 't1',
        name: 'Tree 1',
        root: { id: 'root', type: 'div', props: { color: 'red' }, children: [] },
        updatedAt: 1000,
      }
      let state = reducer(empty, addTree(tree))
      state = reducer(state, updateTreeNode({ treeId: 't1', nodeId: 'root', updates: { props: { color: 'blue' } } }))
      expect(state.trees[0].root.props?.color).toBe('blue')
    })

    it('updates a nested child node', () => {
      const child: ComponentTreeNode = { id: 'child1', type: 'span', children: [] }
      const tree: ComponentTree = {
        id: 't1',
        name: 'Tree 1',
        root: { id: 'root', type: 'div', children: [child] },
        updatedAt: 1000,
      }
      let state = reducer(empty, addTree(tree))
      state = reducer(state, updateTreeNode({ treeId: 't1', nodeId: 'child1', updates: { type: 'p' } }))
      expect(state.trees[0].root.children![0].type).toBe('p')
    })

    it('is a no-op when treeId not found', () => {
      const tree = makeTree('t1')
      let state = reducer(empty, addTree(tree))
      state = reducer(state, updateTreeNode({ treeId: 'ghost', nodeId: 'root', updates: { type: 'span' } }))
      expect(state.trees[0].root.type).toBe('div')
    })

    it('passes through nodes without children unchanged', () => {
      const tree: ComponentTree = {
        id: 't1',
        name: 'Tree 1',
        root: { id: 'root', type: 'div' },
        updatedAt: 1000,
      }
      let state = reducer(empty, addTree(tree))
      state = reducer(state, updateTreeNode({ treeId: 't1', nodeId: 'nonexistent', updates: { type: 'p' } }))
      expect(state.trees[0].root.type).toBe('div')
    })
  })

  describe('syncTreeFromDBAL.fulfilled', () => {
    it('updates existing tree', () => {
      let state = reducer(empty, addTree(makeTree('1', 'Old')))
      const action = {
        type: 'componentTrees/syncFromDBAL/fulfilled',
        payload: makeTree('1', 'Synced'),
      }
      state = reducer(state, action)
      expect(state.trees[0].name).toBe('Synced')
    })

    it('adds tree if not existing', () => {
      const action = {
        type: 'componentTrees/syncFromDBAL/fulfilled',
        payload: makeTree('new-tree'),
      }
      const state = reducer(empty, action)
      expect(state.trees[0].id).toBe('new-tree')
    })

    it('is a no-op when payload is null', () => {
      const action = { type: 'componentTrees/syncFromDBAL/fulfilled', payload: null }
      const state = reducer(empty, action)
      expect(state.trees).toHaveLength(0)
    })
  })
})
