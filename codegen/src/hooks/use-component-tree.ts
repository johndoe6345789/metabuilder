/**
 * Hook for flattening and rendering component tree structure
 * Converts recursive component tree to flat list with depth information
 */
import type { UIComponent } from '@/types/json-ui'

export interface TreeNode {
  component: UIComponent
  depth: number
  hasChildren: boolean
  isSelected: boolean
  paddingLeft: string
}

export function useComponentTree(
  components: UIComponent[],
  selectedId: string | null
): TreeNode[] {
  const flattenTree = (
    items: UIComponent[],
    depth: number = 0
  ): TreeNode[] => {
    const result: TreeNode[] = []
    
    for (const component of items) {
      const hasChildren = Array.isArray(component.children) && component.children.length > 0
      const isSelected = selectedId === component.id
      
      result.push({
        component,
        depth,
        hasChildren,
        isSelected,
        paddingLeft: `${depth * 16 + 8}px`
      })
      
      if (hasChildren) {
        result.push(...flattenTree(component.children as UIComponent[], depth + 1))
      }
    }
    
    return result
  }
  
  return flattenTree(components)
}
