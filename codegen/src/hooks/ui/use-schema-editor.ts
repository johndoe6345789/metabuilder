import { useState, useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import { toast } from 'sonner'
import { UIComponent } from '@/types/json-ui'

export interface SchemaEditorState {
  components: UIComponent[]
  selectedId: string | null
  hoveredId: string | null
}

export function useSchemaEditor() {
  const [components, setComponents, deleteComponents] = useKV<UIComponent[]>('schema-editor-components', [])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const findComponentById = useCallback((id: string, comps: UIComponent[] = components): UIComponent | null => {
    for (const comp of comps) {
      if (comp.id === id) return comp
      if (Array.isArray(comp.children)) {
        const found = findComponentById(id, comp.children)
        if (found) return found
      }
    }
    return null
  }, [components])

  const findParentComponent = useCallback((id: string, comps: UIComponent[] = components, parent: UIComponent | null = null): UIComponent | null => {
    for (const comp of comps) {
      if (comp.id === id) return parent
      if (Array.isArray(comp.children)) {
        const found = findParentComponent(id, comp.children, comp)
        if (found !== null) return found
      }
    }
    return null
  }, [components])

  const addComponent = useCallback((component: UIComponent, targetId?: string, position: 'before' | 'after' | 'inside' = 'inside') => {
    setComponents((current) => {
      const newComps = [...current]
      
      if (!targetId) {
        newComps.push(component)
        return newComps
      }

      const insertComponent = (comps: UIComponent[]): boolean => {
        for (let i = 0; i < comps.length; i++) {
          const comp = comps[i]
          
          if (comp.id === targetId) {
            if (position === 'inside') {
              if (!Array.isArray(comp.children)) {
                comp.children = []
              }
              comp.children.push(component)
            } else if (position === 'before') {
              comps.splice(i, 0, component)
            } else if (position === 'after') {
              comps.splice(i + 1, 0, component)
            }
            return true
          }
          
          if (Array.isArray(comp.children)) {
            if (insertComponent(comp.children)) {
              return true
            }
          }
        }
        return false
      }

      insertComponent(newComps)
      return newComps
    })
    
    setSelectedId(component.id)
    toast.success('Component added')
  }, [setComponents])

  const updateComponent = useCallback((id: string, updates: Partial<UIComponent>) => {
    setComponents((current) => {
      const updateInTree = (comps: UIComponent[]): UIComponent[] => {
        return comps.map(comp => {
          if (comp.id === id) {
            return { ...comp, ...updates }
          }
          if (Array.isArray(comp.children)) {
            return {
              ...comp,
              children: updateInTree(comp.children)
            }
          }
          return comp
        })
      }
      
      return updateInTree(current)
    })
  }, [setComponents])

  const deleteComponent = useCallback((id: string) => {
    setComponents((current) => {
      const deleteFromTree = (comps: UIComponent[]): UIComponent[] => {
        return comps.filter(comp => {
          if (comp.id === id) return false
          if (Array.isArray(comp.children)) {
            comp.children = deleteFromTree(comp.children)
          }
          return true
        })
      }
      
      return deleteFromTree(current)
    })
    
    if (selectedId === id) {
      setSelectedId(null)
    }
    toast.success('Component deleted')
  }, [selectedId, setComponents])

  const moveComponent = useCallback((sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    setComponents((current) => {
      const component = findComponentById(sourceId, current)
      if (!component) return current
      
      const newComps = [...current]
      
      const removeFromTree = (comps: UIComponent[]): UIComponent[] => {
        return comps.filter(comp => {
          if (comp.id === sourceId) return false
          if (Array.isArray(comp.children)) {
            comp.children = removeFromTree(comp.children)
          }
          return true
        })
      }
      
      const cleanedComps = removeFromTree(newComps)
      
      const insertComponent = (comps: UIComponent[]): boolean => {
        for (let i = 0; i < comps.length; i++) {
          const comp = comps[i]
          
          if (comp.id === targetId) {
            if (position === 'inside') {
              if (!Array.isArray(comp.children)) {
                comp.children = []
              }
              comp.children.push(component)
            } else if (position === 'before') {
              comps.splice(i, 0, component)
            } else if (position === 'after') {
              comps.splice(i + 1, 0, component)
            }
            return true
          }
          
          if (Array.isArray(comp.children)) {
            if (insertComponent(comp.children)) {
              return true
            }
          }
        }
        return false
      }

      insertComponent(cleanedComps)
      return cleanedComps
    })
  }, [findComponentById, setComponents])

  const clearAll = useCallback(() => {
    deleteComponents()
    setSelectedId(null)
    setHoveredId(null)
    toast.success('Canvas cleared')
  }, [deleteComponents])

  return {
    components,
    selectedId,
    hoveredId,
    setSelectedId,
    setHoveredId,
    findComponentById,
    findParentComponent,
    addComponent,
    updateComponent,
    deleteComponent,
    moveComponent,
    clearAll,
  }
}
