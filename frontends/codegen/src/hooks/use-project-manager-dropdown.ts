/**
 * useProjectManagerDropdown
 *
 * Self-contained state + actions for the project
 * manager popover. All project CRUD is via
 * useProjectService. I/O is delegated to useProjectIO.
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import { toast } from '@/components/ui/sonner'
import {
  useProjectService,
  type SavedProject,
} from '@/lib/project-service'
import type { Project } from '@/types/project'
import { useProjectState } from '@/hooks/use-project-state'
import { useProjectIO } from './use-project-io'

export function useProjectManagerDropdown() {
  const projectState = useProjectState()
  const projectService = useProjectService()
  const [projects, setProjects] = useState<
    SavedProject[]
  >([])
  const [projectsLoaded, setProjectsLoaded] =
    useState(false)
  const [open, setOpenState] = useState(false)
  const [saveAsName, setSaveAsName] = useState('')
  const [showSaveAs, setShowSaveAs] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(
    null
  )

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
      storybookStories:
        projectState.storybookStories,
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

  const currentName =
    projectState.nextjsConfig.appName ||
    'Untitled Project'
  const currentId = (
    currentProject as unknown as Record<
      string,
      unknown
    >
  )?.id as string | undefined

  const loadIntoState = useCallback(
    (project: Project) => {
      if (project.files)
        projectState.setFiles(project.files)
      if (project.models)
        projectState.setModels(project.models)
      if (project.components)
        projectState.setComponents(project.components)
      if (project.componentTrees)
        projectState.setComponentTrees(
          project.componentTrees
        )
      if (project.workflows)
        projectState.setWorkflows(project.workflows)
      if (project.lambdas)
        projectState.setLambdas(project.lambdas)
      if (project.theme)
        projectState.setTheme(project.theme)
      if (project.playwrightTests)
        projectState.setPlaywrightTests(
          project.playwrightTests
        )
      if (project.storybookStories)
        projectState.setStorybookStories(
          project.storybookStories
        )
      if (project.unitTests)
        projectState.setUnitTests(project.unitTests)
      if (project.flaskConfig)
        projectState.setFlaskConfig(project.flaskConfig)
      if (project.nextjsConfig)
        projectState.setNextjsConfig(
          project.nextjsConfig
        )
      if (project.npmSettings)
        projectState.setNpmSettings(project.npmSettings)
      if (project.featureToggles)
        projectState.setFeatureToggles(
          project.featureToggles
        )
    },
    [projectState]
  )

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

  const handleOpen = useCallback(
    (isOpen: boolean) => {
      setOpenState(isOpen)
      if (isOpen && !projectsLoaded) {
        loadProjectsList()
      }
    },
    [projectsLoaded, loadProjectsList]
  )

  const toggleOpen = useCallback(
    () => handleOpen(!open),
    [open, handleOpen]
  )

  const closePopover = useCallback(
    () => handleOpen(false),
    [handleOpen]
  )

  const handleSave = useCallback(() => {
    const id =
      currentId ||
      projectService.generateProjectId()
    projectService.saveProject(
      id,
      currentName,
      currentProject
    )
    toast.success(`Project "${currentName}" saved`)
    loadProjectsList()
  }, [
    currentId,
    currentName,
    currentProject,
    projectService,
    loadProjectsList,
  ])

  const handleSaveAs = useCallback(() => {
    if (!saveAsName.trim()) return
    const id = projectService.generateProjectId()
    projectService.saveProject(
      id,
      saveAsName.trim(),
      currentProject
    )
    toast.success(
      `Project saved as "${saveAsName.trim()}"`
    )
    setSaveAsName('')
    setShowSaveAs(false)
    loadProjectsList()
  }, [
    saveAsName,
    currentProject,
    projectService,
    loadProjectsList,
  ])

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
      nextjsConfig: {
        appName: 'New Project',
      } as Project['nextjsConfig'],
      npmSettings: {} as Project['npmSettings'],
      featureToggles:
        {} as Project['featureToggles'],
    }
    loadIntoState(empty)
    toast.success('New project created')
    setOpenState(false)
  }, [loadIntoState])

  const handleLoad = useCallback(
    (saved: SavedProject) => {
      loadIntoState(saved.data)
      toast.success(`Loaded "${saved.name}"`)
      setOpenState(false)
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

  const showSaveAsForm = useCallback(
    () => setShowSaveAs(true),
    []
  )

  const handleSaveAsNameChange = useCallback(
    (
      valueOrEvent:
        | string
        | { target: { value: string } }
    ) => {
      const value =
        typeof valueOrEvent === 'string'
          ? valueOrEvent
          : valueOrEvent?.target?.value ?? ''
      setSaveAsName(value)
    },
    []
  )

  const { handleExport, triggerImport } = useProjectIO({
    currentId,
    currentName,
    currentProject,
    onImportLoaded: loadIntoState,
    onImportListReload: loadProjectsList,
    onImportClose: () => setOpenState(false),
  })

  return {
    open,
    setOpen: handleOpen,
    toggleOpen,
    closePopover,
    currentName,
    projects,
    isLoading,
    showEmpty:
      !isLoading &&
      (!projects || projects.length === 0),
    showSaveAs,
    setShowSaveAs,
    showSaveAsForm,
    saveAsName,
    setSaveAsName,
    handleSaveAsNameChange,
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
