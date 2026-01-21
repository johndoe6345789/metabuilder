import { useKV } from '@/hooks/use-kv'
import { useCallback } from 'react'
import { PrismaModel } from '@/types/project'

export function useModels() {
  const [models, setModels] = useKV<PrismaModel[]>('project-models', [])
  
  const addModel = useCallback((model: PrismaModel) => {
    setModels(current => [...(current || []), model])
  }, [setModels])
  
  const updateModel = useCallback((modelId: string, updates: Partial<PrismaModel>) => {
    setModels(current =>
      (current || []).map(m => m.id === modelId ? { ...m, ...updates } : m)
    )
  }, [setModels])
  
  const deleteModel = useCallback((modelId: string) => {
    setModels(current => (current || []).filter(m => m.id !== modelId))
  }, [setModels])
  
  const getModel = useCallback((modelId: string) => {
    return models?.find(m => m.id === modelId)
  }, [models])
  
  return {
    models: models || [],
    addModel,
    updateModel,
    deleteModel,
    getModel,
  }
}
