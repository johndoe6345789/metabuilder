import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ProjectService, SavedProject } from '@/lib/project-service'

export function useProjectManager() {
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadProjectsList = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await ProjectService.listProjects()
      setProjects(list)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects list')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProjectsList()
  }, [loadProjectsList])

  return {
    projects,
    isLoading,
    loadProjectsList,
  }
}
