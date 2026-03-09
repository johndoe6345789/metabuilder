import { useAppDispatch, useAppSelector } from '@/store'
import {
  loadComponentTrees,
  saveComponentTree,
  deleteComponentTree,
  setActiveTree,
  updateTreeNode,
  ComponentTree,
  ComponentTreeNode,
} from '@/store/slices/componentTreesSlice'
import { useCallback } from 'react'

export function useReduxComponentTrees() {
  const dispatch = useAppDispatch()
  const trees = useAppSelector((state) => state.componentTrees.trees)
  const activeTreeId = useAppSelector((state) => state.componentTrees.activeTreeId)
  const loading = useAppSelector((state) => state.componentTrees.loading)
  const error = useAppSelector((state) => state.componentTrees.error)

  const activeTree = trees.find(t => t.id === activeTreeId)

  const load = useCallback(() => {
    dispatch(loadComponentTrees())
  }, [dispatch])

  const save = useCallback((tree: ComponentTree) => {
    dispatch(saveComponentTree(tree))
  }, [dispatch])

  const remove = useCallback((treeId: string) => {
    dispatch(deleteComponentTree(treeId))
  }, [dispatch])

  const setActive = useCallback((treeId: string) => {
    dispatch(setActiveTree(treeId))
  }, [dispatch])

  const updateNode = useCallback((treeId: string, nodeId: string, updates: Partial<ComponentTreeNode>) => {
    dispatch(updateTreeNode({ treeId, nodeId, updates }))
  }, [dispatch])

  return {
    trees,
    activeTree,
    activeTreeId,
    loading,
    error,
    load,
    save,
    remove,
    setActive,
    updateNode,
  }
}
