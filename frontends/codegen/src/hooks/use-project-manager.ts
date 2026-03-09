import { useCallback, useEffect, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { useProjectService, SavedProject } from '@/lib/project-service'

export function useProjectManager() {
  const projectService = useProjectService()
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadProjectsList = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await projectService.listProjects()
      setProjects(list)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects list')
    } finally {
      setIsLoading(false)
    }
  }, [projectService])

  useEffect(() => {
    void loadProjectsList()
  }, [loadProjectsList])

  return {
    projects,
    isLoading,
    loadProjectsList,
  }
}
