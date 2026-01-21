import { useKV } from '@/hooks/use-kv'
import { useCallback } from 'react'
import { ComponentNode } from '@/types/project'

export function useComponents() {
  const [components, setComponents] = useKV<ComponentNode[]>('project-components', [])
  
  const addComponent = useCallback((component: ComponentNode) => {
    setComponents(current => [...(current || []), component])
  }, [setComponents])
  
  const updateComponent = useCallback((componentId: string, updates: Partial<ComponentNode>) => {
    setComponents(current =>
      (current || []).map(c => c.id === componentId ? { ...c, ...updates } : c)
    )
  }, [setComponents])
  
  const deleteComponent = useCallback((componentId: string) => {
    setComponents(current => (current || []).filter(c => c.id !== componentId))
  }, [setComponents])
  
  const getComponent = useCallback((componentId: string) => {
    return components?.find(c => c.id === componentId)
  }, [components])
  
  return {
    components: components || [],
    addComponent,
    updateComponent,
    deleteComponent,
    getComponent,
  }
}
