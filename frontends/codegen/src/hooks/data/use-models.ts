import { useAppDispatch, useAppSelector } from '@/store'
import { addModel as addModelAction, updateModel as updateModelAction, removeModel, setModels } from '@/store/slices/modelsSlice'
import { useCallback } from 'react'
import { DbModel } from '@/types/project'

export function useModels() {
  const dispatch = useAppDispatch()
  const sliceModels = useAppSelector((s) => s.models?.models ?? [])
  const models = sliceModels as unknown as DbModel[]
  
  const addModel = useCallback((model: DbModel) => {
    dispatch(addModelAction(model as any))
  }, [dispatch])
  
  const updateModel = useCallback((modelId: string, updates: Partial<DbModel>) => {
    const existing = models.find(m => m.id === modelId)
    if (existing) {
      dispatch(updateModelAction({ ...existing, ...updates } as any))
    }
  }, [dispatch, models])
  
  const deleteModel = useCallback((modelId: string) => {
    dispatch(removeModel(modelId))
  }, [dispatch])
  
  const getModel = useCallback((modelId: string) => {
    return models.find(m => m.id === modelId)
  }, [models])
  
  return {
    models,
    addModel,
    updateModel,
    deleteModel,
    getModel,
  }
}
