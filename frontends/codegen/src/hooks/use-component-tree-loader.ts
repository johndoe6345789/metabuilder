import { useCallback, useEffect, useRef, useState } from 'react'
import { ComponentTree } from '@/types/project'
import componentTreesData from '@/config/component-trees'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUIState } from '@/store/slices/uiStateSlice'

type ComponentTreeLoaderOptions = {
  autoLoad?: boolean
}

export function useComponentTreeLoader({ autoLoad = true }: ComponentTreeLoaderOptions = {}) {
  const dispatch = useAppDispatch()
  const storedTrees = useAppSelector((state) => state.uiState.data['project-component-trees']) as ComponentTree[] | undefined
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loadedRef = useRef(false)

  const loadComponentTrees = useCallback(async () => {
    if (loadedRef.current) return

    loadedRef.current = true
    setIsLoading(true)

    const existingTrees = storedTrees

    if (!existingTrees || !Array.isArray(existingTrees) || existingTrees.length === 0) {
      dispatch(setUIState({ key: 'project-component-trees', value: componentTreesData.all }))
    } else {
      const newTrees = componentTreesData.all.filter(
        newTree => !existingTrees.some(existingTree => existingTree.id === newTree.id)
      )

      if (newTrees.length > 0) {
        const mergedTrees = [...existingTrees, ...newTrees]
        dispatch(setUIState({ key: 'project-component-trees', value: mergedTrees }))
      }
    }

    setIsLoaded(true)
    setIsLoading(false)
  }, [dispatch, storedTrees])

  const getComponentTrees = useCallback((): ComponentTree[] => {
    return (storedTrees && Array.isArray(storedTrees)) ? storedTrees : componentTreesData.all
  }, [storedTrees])

  const getComponentTreesByCategory = useCallback((category: 'molecule' | 'organism'): ComponentTree[] => {
    const trees = getComponentTrees()
    return trees.filter(tree => (tree as any).category === category)
  }, [getComponentTrees])

  const getComponentTreeById = useCallback((id: string): ComponentTree | undefined => {
    const trees = getComponentTrees()
    return trees.find(tree => tree.id === id)
  }, [getComponentTrees])

  const getComponentTreeByName = useCallback((name: string): ComponentTree | undefined => {
    const trees = getComponentTrees()
    return trees.find(tree => tree.name === name)
  }, [getComponentTrees])

  const reloadFromJSON = useCallback(() => {
    setIsLoading(true)
    dispatch(setUIState({ key: 'project-component-trees', value: componentTreesData.all }))
    loadedRef.current = true
    setIsLoaded(true)
    setIsLoading(false)
  }, [dispatch])

  useEffect(() => {
    if (autoLoad) {
      loadComponentTrees()
    }
  }, [autoLoad, loadComponentTrees])

  return {
    isLoaded,
    isLoading,
    error,
    loadComponentTrees,
    getComponentTrees,
    getComponentTreesByCategory,
    getComponentTreeById,
    getComponentTreeByName,
    reloadFromJSON,
    moleculeTrees: componentTreesData.molecules,
    organismTrees: componentTreesData.organisms,
    allTrees: componentTreesData.all,
  }
}
