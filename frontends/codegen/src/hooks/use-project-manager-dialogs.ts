import { useCallback, useState } from 'react'
import { toast } from '@/components/ui/sonner'
import { useProjectService, SavedProject } from '@/lib/project-service'
import { Project } from '@/types/project'

interface UseProjectManagerDialogsOptions {
  currentProject: Project
  onProjectLoad: (project: Project) => void
  loadProjectsList: () => Promise<void>
}

export function useProjectManagerDialogs({
  currentProject,
  onProjectLoad,
  loadProjectsList,
}: UseProjectManagerDialogsOptions) {
  const projectService = useProjectService()
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null)
  const [importJson, setImportJson] = useState('')

  const handleSaveProject = useCallback(async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name')
      return
    }

    try {
      const id = currentProjectId || projectService.generateProjectId()

      await projectService.saveProject(
        id,
        projectName,
        currentProject,
        projectDescription
      )

      setCurrentProjectId(id)
      toast.success('Project saved successfully!')
      setSaveDialogOpen(false)
      await loadProjectsList()
    } catch (error) {
      console.error('Failed to save project:', error)
      toast.error('Failed to save project')
    }
  }, [currentProject, currentProjectId, loadProjectsList, projectDescription, projectName, projectService])

  const handleLoadProject = useCallback(async (project: SavedProject) => {
    try {
      onProjectLoad(project.data)
      setCurrentProjectId(project.id)
      setProjectName(project.name)
      setProjectDescription(project.description || '')
      setLoadDialogOpen(false)
      toast.success(`Loaded project: ${project.name}`)
    } catch (error) {
      console.error('Failed to load project:', error)
      toast.error('Failed to load project')
    }
  }, [onProjectLoad])

  const handleDeleteProject = useCallback(async () => {
    if (!projectToDelete) return

    try {
      await projectService.deleteProject(projectToDelete)
      toast.success('Project deleted successfully')
      setDeleteDialogOpen(false)
      setProjectToDelete(null)

      if (currentProjectId === projectToDelete) {
        setCurrentProjectId(null)
        setProjectName('')
        setProjectDescription('')
      }

      await loadProjectsList()
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project')
    }
  }, [currentProjectId, loadProjectsList, projectToDelete, projectService])

  const handleDuplicateProject = useCallback(async (id: string, name: string) => {
    try {
      const duplicated = await projectService.duplicateProject(id, `${name} (Copy)`)
      if (duplicated) {
        toast.success('Project duplicated successfully')
        await loadProjectsList()
      }
    } catch (error) {
      console.error('Failed to duplicate project:', error)
      toast.error('Failed to duplicate project')
    }
  }, [loadProjectsList, projectService])

  const handleExportProject = useCallback(async (id: string, name: string) => {
    try {
      const json = await projectService.exportProjectAsJSON(id)
      if (json) {
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Project exported successfully')
      }
    } catch (error) {
      console.error('Failed to export project:', error)
      toast.error('Failed to export project')
    }
  }, [projectService])

  const handleImportProject = useCallback(async () => {
    if (!importJson.trim()) {
      toast.error('Please paste project JSON')
      return
    }

    try {
      const imported = await projectService.importProjectFromJSON(importJson)
      if (imported) {
        toast.success('Project imported successfully')
        setImportDialogOpen(false)
        setImportJson('')
        await loadProjectsList()
      } else {
        toast.error('Invalid project JSON')
      }
    } catch (error) {
      console.error('Failed to import project:', error)
      toast.error('Failed to import project')
    }
  }, [importJson, loadProjectsList, projectService])

  const handleNewProject = useCallback(() => {
    setCurrentProjectId(null)
    setProjectName('')
    setProjectDescription('')
    setNewProjectDialogOpen(false)
    toast.success('New project started')
  }, [])

  return {
    currentProjectId,
    projectName,
    projectDescription,
    importJson,
    saveDialogOpen,
    loadDialogOpen,
    newProjectDialogOpen,
    deleteDialogOpen,
    importDialogOpen,
    projectToDelete,
    setSaveDialogOpen,
    setLoadDialogOpen,
    setNewProjectDialogOpen,
    setDeleteDialogOpen,
    setImportDialogOpen,
    setProjectToDelete,
    setProjectName,
    setProjectDescription,
    setImportJson,
    handleSaveProject,
    handleLoadProject,
    handleDeleteProject,
    handleDuplicateProject,
    handleExportProject,
    handleImportProject,
    handleNewProject,
  }
}
