import { useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'

export interface IdeaGroup {
  id: string
  label: string
  color: string
  createdAt: number
}

export function useIdeaGroups() {
  const [groups, setGroups] = useKV<IdeaGroup[]>('feature-idea-groups', [])

  const addGroup = useCallback((group: IdeaGroup) => {
    setGroups((current) => [...(current || []), group])
  }, [setGroups])

  const updateGroup = useCallback((id: string, updates: Partial<IdeaGroup>) => {
    setGroups((current) => 
      (current || []).map(group => 
        group.id === id ? { ...group, ...updates } : group
      )
    )
  }, [setGroups])

  const deleteGroup = useCallback((id: string) => {
    setGroups((current) => (current || []).filter(group => group.id !== id))
  }, [setGroups])

  const saveGroup = useCallback((group: IdeaGroup) => {
    setGroups((current) => {
      const existing = (current || []).find(g => g.id === group.id)
      if (existing) {
        return (current || []).map(g => g.id === group.id ? group : g)
      } else {
        return [...(current || []), group]
      }
    })
  }, [setGroups])

  return {
    groups: groups || [],
    addGroup,
    updateGroup,
    deleteGroup,
    saveGroup,
    setGroups,
  }
}
