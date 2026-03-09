import { useAppDispatch, useAppSelector } from '@/store'
import { addComponent as addComponentAction, updateComponent as updateComponentAction, removeComponent, setComponents } from '@/store/slices/componentsSlice'
import { useCallback } from 'react'
import { ComponentNode } from '@/types/project'

export function useComponents() {
  const dispatch = useAppDispatch()
  const sliceComponents = useAppSelector((s) => s.components?.components ?? [])
  const components = sliceComponents as unknown as ComponentNode[]
  
  const addComponent = useCallback((component: ComponentNode) => {
    dispatch(addComponentAction(component as any))
  }, [dispatch])
  
  const updateComponent = useCallback((componentId: string, updates: Partial<ComponentNode>) => {
    const existing = components.find(c => c.id === componentId)
    if (existing) {
      dispatch(updateComponentAction({ ...existing, ...updates } as any))
    }
  }, [dispatch, components])
  
  const deleteComponent = useCallback((componentId: string) => {
    dispatch(removeComponent(componentId))
  }, [dispatch])
  
  const getComponent = useCallback((componentId: string) => {
    return components.find(c => c.id === componentId)
  }, [components])
  
  return {
    components,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponent,
  }
}
