/// <reference path="../global.d.ts" />

import { useCallback, useEffect, useState } from 'react'
import { ComponentTree } from '@/types/project'
import componentTreesData from '@/config/component-trees'

type ComponentTreeLoaderOptions = {
  autoLoad?: boolean
}

export function useComponentTreeLoader({ autoLoad = true }: ComponentTreeLoaderOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadComponentTrees = useCallback(async () => {
    if (isLoading || isLoaded) {
      console.log('[COMPONENT_TREES] ⏭️ Skipping load (already loading or loaded)')
      return
    }

    console.log('[COMPONENT_TREES] 🚀 Starting component trees load')
    setIsLoading(true)
    setError(null)
    console.time('[COMPONENT_TREES] Load duration')

    try {
      if (!window.spark?.kv) {
        console.warn('[COMPONENT_TREES] ⚠️ Spark KV not available')
        throw new Error('Spark KV not available')
      }

      const existingTrees = await window.spark.kv.get<ComponentTree[]>('project-component-trees')
      
      if (!existingTrees || existingTrees.length === 0) {
        console.log('[COMPONENT_TREES] 📦 No existing component trees, loading from JSON')
        await window.spark.kv.set('project-component-trees', componentTreesData.all)
        console.log('[COMPONENT_TREES] ✅ Loaded', componentTreesData.all.length, 'component trees')
      } else {
        console.log('[COMPONENT_TREES] ✅ Found', existingTrees.length, 'existing component trees')
        
        const newTrees = componentTreesData.all.filter(
          newTree => !existingTrees.some(existingTree => existingTree.id === newTree.id)
        )

        if (newTrees.length > 0) {
          console.log('[COMPONENT_TREES] 📦 Merging', newTrees.length, 'new component trees')
          const mergedTrees = [...existingTrees, ...newTrees]
          await window.spark.kv.set('project-component-trees', mergedTrees)
          console.log('[COMPONENT_TREES] ✅ Merged component trees, total:', mergedTrees.length)
        }
      }

      setIsLoaded(true)
      console.log('[COMPONENT_TREES] ✅ Component trees load complete')
    } catch (err) {
      console.error('[COMPONENT_TREES] ❌ Failed to load component trees:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
      console.timeEnd('[COMPONENT_TREES] Load duration')
    }
  }, [isLoading, isLoaded])

  const getComponentTrees = useCallback(async (): Promise<ComponentTree[]> => {
    if (!window.spark?.kv) {
      console.warn('[COMPONENT_TREES] ⚠️ Spark KV not available')
      return []
    }

    const trees = await window.spark.kv.get<ComponentTree[]>('project-component-trees')
    return trees || []
  }, [])

  const getComponentTreesByCategory = useCallback(async (category: 'molecule' | 'organism'): Promise<ComponentTree[]> => {
    const trees = await getComponentTrees()
    return trees.filter(tree => (tree as any).category === category)
  }, [getComponentTrees])

  const getComponentTreeById = useCallback(async (id: string): Promise<ComponentTree | undefined> => {
    const trees = await getComponentTrees()
    return trees.find(tree => tree.id === id)
  }, [getComponentTrees])

  const getComponentTreeByName = useCallback(async (name: string): Promise<ComponentTree | undefined> => {
    const trees = await getComponentTrees()
    return trees.find(tree => tree.name === name)
  }, [getComponentTrees])

  const reloadFromJSON = useCallback(async () => {
    console.log('[COMPONENT_TREES] 🔄 Reloading component trees from JSON')
    setIsLoading(true)
    setError(null)

    try {
      if (!window.spark?.kv) {
        throw new Error('Spark KV not available')
      }

      await window.spark.kv.set('project-component-trees', componentTreesData.all)
      console.log('[COMPONENT_TREES] ✅ Reloaded', componentTreesData.all.length, 'component trees')
      setIsLoaded(true)
    } catch (err) {
      console.error('[COMPONENT_TREES] ❌ Failed to reload component trees:', err)
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }, [])

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
