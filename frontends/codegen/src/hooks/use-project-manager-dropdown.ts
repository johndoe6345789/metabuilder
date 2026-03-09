/**
 * useProjectManagerDropdown — self-contained state + actions for the project manager popover
 *
 * Gets currentProject and handleProjectLoad from Redux (useProjectState) internally
 * to avoid prop-driven re-render cascades. All project CRUD via useProjectService.
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { toast } from '@/components/ui/sonner'
import { useProjectService, type SavedProject } from '@/lib/project-service'
import type { Project } from '@/types/project'
import { useProjectState } from '@/hooks/use-project-state'

export function useProjectManagerDropdown() {
  const projectState = useProjectState()
  const projectService = useProjectService()
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [saveAsName, setSaveAsName] = useState('')
  const [showSaveAs, setShowSaveAs] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Derive currentProject from Redux state — stable references from slices
  const currentProject = useMemo<Project>(
    () => ({
      name: projectState.nextjsConfig.appName,
      files: projectState.files,
      models: projectState.models,
      components: projectState.components,
      componentTrees: projectState.componentTrees,
      workflows: projectState.workflows,
      lambdas: projectState.lambdas,
      theme: projectState.theme,
      playwrightTests: projectState.playwrightTests,
      storybookStories: projectState.storybookStories,
      unitTests: projectState.unitTests,
      flaskConfig: projectState.flaskConfig,
      nextjsConfig: projectState.nextjsConfig,
      npmSettings: projectState.npmSettings,
      featureToggles: projectState.featureToggles,
    }),
    [
      projectState.nextjsConfig,
      projectState.files,
      projectState.models,
      projectState.components,
      projectState.componentTrees,
      projectState.workflows,
      projectState.lambdas,
      projectState.theme,
      projectState.playwrightTests,
      projectState.storybookStories,
      projectState.unitTests,
      projectState.flaskConfig,
      projectState.npmSettings,
      projectState.featureToggles,
    ]
  )

  const currentName = projectState.nextjsConfig.appName || 'Untitled Project'
  const currentId = (currentProject as unknown as Record<string, unknown>)?.id as string | undefined

  /** Load project data into Redux state */
  const loadIntoState = useCallback(
    (project: Project) => {
      if (project.files) projectState.setFiles(project.files)
      if (project.models) projectState.setModels(project.models)
      if (project.components) projectState.setComponents(project.components)
      if (project.componentTrees) projectState.setComponentTrees(project.componentTrees)
      if (project.workflows) projectState.setWorkflows(project.workflows)
      if (project.lambdas) projectState.setLambdas(project.lambdas)
      if (project.theme) projectState.setTheme(project.theme)
      if (project.playwrightTests) projectState.setPlaywrightTests(project.playwrightTests)
      if (project.storybookStories) projectState.setStorybookStories(project.storybookStories)
      if (project.unitTests) projectState.setUnitTests(project.unitTests)
      if (project.flaskConfig) projectState.setFlaskConfig(project.flaskConfig)
      if (project.nextjsConfig) projectState.setNextjsConfig(project.nextjsConfig)
      if (project.npmSettings) projectState.setNpmSettings(project.npmSettings)
      if (project.featureToggles) projectState.setFeatureToggles(project.featureToggles)
    },
    // setters from Redux slices are stable — safe to list
    [projectState]
  )

  /** Load the saved projects list from KV store (on-demand, not on mount) */
  const loadProjectsList = useCallback(() => {
    setIsLoading(true)
    try {
      const list = projectService.listProjects()
      setProjects(list)
      setProjectsLoaded(true)
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects list')
    } finally {
      setIsLoading(false)
    }
  }, [projectService])

  /** Open the popover and lazy-load projects list */
  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpen(isOpen)
      if (isOpen && !projectsLoaded) {
        loadProjectsList()
      }
    },
    [projectsLoaded, loadProjectsList]
  )

  /** Toggle popover open/close */
  const toggleOpen = useCallback(() => {
    handleOpen(!open)
  }, [open, handleOpen])

  const handleSave = useCallback(() => {
    const id = currentId || projectService.generateProjectId()
    projectService.saveProject(id, currentName, currentProject)
    toast.success(`Project "${currentName}" saved`)
    loadProjectsList()
  }, [currentId, currentName, currentProject, projectService, loadProjectsList])

  const handleSaveAs = useCallback(() => {
    if (!saveAsName.trim()) return
    const id = projectService.generateProjectId()
    projectService.saveProject(id, saveAsName.trim(), currentProject)
    toast.success(`Project saved as "${saveAsName.trim()}"`)
    setSaveAsName('')
    setShowSaveAs(false)
    loadProjectsList()
  }, [saveAsName, currentProject, projectService, loadProjectsList])

  const handleNew = useCallback(() => {
    const empty: Project = {
      name: 'New Project',
      files: [],
      models: [],
      components: [],
      componentTrees: [],
      workflows: [],
      lambdas: [],
      theme: {} as Project['theme'],
      playwrightTests: [],
      storybookStories: [],
      unitTests: [],
      flaskConfig: {} as Project['flaskConfig'],
      nextjsConfig: { appName: 'New Project' } as Project['nextjsConfig'],
      npmSettings: {} as Project['npmSettings'],
      featureToggles: {} as Project['featureToggles'],
    }
    loadIntoState(empty)
    toast.success('New project created')
    setOpen(false)
  }, [loadIntoState])

  const handleLoad = useCallback(
    (saved: SavedProject) => {
      loadIntoState(saved.data)
      toast.success(`Loaded "${saved.name}"`)
      setOpen(false)
    },
    [loadIntoState]
  )

  const handleDelete = useCallback(
    (id: string, name: string) => {
      projectService.deleteProject(id)
      toast.success(`Deleted "${name}"`)
      loadProjectsList()
    },
    [projectService, loadProjectsList]
  )

  const handleExport = useCallback(() => {
    const id = currentId || 'export'
    const json = projectService.exportProjectAsJSON(id)
    if (!json) {
      // Fallback: export current project directly
      const blob = new Blob([JSON.stringify({ name: currentName, data: currentProject }, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentName.replace(/\s+/g, '-').toLowerCase()}.json`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentName.replace(/\s+/g, '-').toLowerCase()}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
    toast.success('Project exported')
  }, [currentId, currentName, currentProject, projectService])

  const handleImport = useCallback(
    (event: Event) => {
      const input = event.target as HTMLInputElement
      const file = input.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        const result = projectService.importProjectFromJSON(reader.result as string)
        if (result) {
          loadIntoState(result.data)
          toast.success(`Imported "${result.name}"`)
          loadProjectsList()
          setOpen(false)
        } else {
          toast.error('Failed to import project')
        }
      }
      reader.readAsText(file)
      input.value = ''
    },
    [projectService, loadIntoState, loadProjectsList]
  )

  const triggerImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.addEventListener('change', handleImport)
    input.click()
  }, [handleImport])

  // Derived: show empty state when not loading and no projects
  const showEmpty = !isLoading && (!projects || projects.length === 0)

  /** Close the popover (for backdrop click) */
  const closePopover = useCallback(() => {
    handleOpen(false)
  }, [handleOpen])

  /** Show the Save As form — direct handler for JSON onClick binding
   *  (JSON expression evaluator cannot handle `() => data(true)` transforms) */
  const showSaveAsForm = useCallback(() => {
    setShowSaveAs(true)
  }, [])

  /** Accepts raw string OR React ChangeEvent from <input onChange>
   *  (JSON expression evaluator cannot handle `(e) => data(e.target.value)` transforms) */
  const handleSaveAsNameChange = useCallback((valueOrEvent: string | { target: { value: string } }) => {
    const value = typeof valueOrEvent === 'string'
      ? valueOrEvent
      : valueOrEvent?.target?.value ?? ''
    setSaveAsName(value)
  }, [])

  return {
    // Popover state
    open,
    setOpen: handleOpen,
    toggleOpen,
    closePopover,
    // Project info
    currentName,
    projects,
    isLoading,
    showEmpty,
    // Save As sub-form
    showSaveAs,
    setShowSaveAs,
    showSaveAsForm,
    saveAsName,
    setSaveAsName,
    handleSaveAsNameChange,
    // Actions
    handleSave,
    handleSaveAs,
    handleNew,
    handleLoad,
    handleDelete,
    handleExport,
    triggerImport,
    fileInputRef,
  }
}
