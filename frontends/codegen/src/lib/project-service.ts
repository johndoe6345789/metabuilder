import { Project } from '@/types/project'
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUIState, deleteUIState } from '@/store/slices/uiStateSlice'

export interface SavedProject {
  id: string
  name: string
  description?: string
  data: Project
  createdAt: number
  updatedAt: number
  version: string
}

const PROJECT_VERSION = '1.0.0'
const PROJECTS_LIST_KEY = 'codeforge-projects-list'
const PROJECT_PREFIX = 'codeforge-project-'

export function useProjectService() {
  const dispatch = useAppDispatch()
  const kvData = useAppSelector((state) => state.uiState.data)

  const getKV = useCallback(<T>(key: string): T | null => {
    const val = kvData[key]
    return (val !== undefined ? val : null) as T | null
  }, [kvData])

  const setKVValue = useCallback(<T>(key: string, value: T): void => {
    dispatch(setUIState({ key, value }))
  }, [dispatch])

  const removeKV = useCallback((key: string): void => {
    dispatch(deleteUIState(key))
  }, [dispatch])

  const listProjects = useCallback((): SavedProject[] => {
    const projectIds = getKV<string[]>(PROJECTS_LIST_KEY)
    if (!projectIds || projectIds.length === 0) {
      return []
    }

    const projects: SavedProject[] = []
    for (const id of projectIds) {
      const project = getKV<SavedProject>(`${PROJECT_PREFIX}${id}`)
      if (project) {
        projects.push(project)
      }
    }

    return projects.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [getKV])

  const saveProject = useCallback((
    id: string,
    name: string,
    projectData: Project,
    description?: string
  ): SavedProject => {
    const now = Date.now()

    const existingProject = getKV<SavedProject>(`${PROJECT_PREFIX}${id}`)

    const savedProject: SavedProject = {
      id,
      name,
      description,
      data: projectData,
      createdAt: existingProject?.createdAt || now,
      updatedAt: now,
      version: PROJECT_VERSION,
    }

    setKVValue(`${PROJECT_PREFIX}${id}`, savedProject)

    const projectIds = getKV<string[]>(PROJECTS_LIST_KEY) || []
    if (!projectIds.includes(id)) {
      setKVValue(PROJECTS_LIST_KEY, [...projectIds, id])
    }

    return savedProject
  }, [getKV, setKVValue])

  const loadProject = useCallback((id: string): SavedProject | null => {
    return getKV<SavedProject>(`${PROJECT_PREFIX}${id}`)
  }, [getKV])

  const deleteProject = useCallback((id: string): void => {
    removeKV(`${PROJECT_PREFIX}${id}`)

    const projectIds = getKV<string[]>(PROJECTS_LIST_KEY) || []
    const updatedIds = projectIds.filter((pid) => pid !== id)
    setKVValue(PROJECTS_LIST_KEY, updatedIds)
  }, [getKV, setKVValue, removeKV])

  const duplicateProject = useCallback((id: string, newName: string): SavedProject | null => {
    const project = loadProject(id)
    if (!project) {
      return null
    }

    const newId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    return saveProject(newId, newName, project.data, project.description)
  }, [loadProject, saveProject])

  const exportProjectAsJSON = useCallback((id: string): string | null => {
    const project = loadProject(id)
    if (!project) {
      return null
    }

    return JSON.stringify(project, null, 2)
  }, [loadProject])

  const importProjectFromJSON = useCallback((jsonString: string): SavedProject | null => {
    try {
      const imported = JSON.parse(jsonString) as SavedProject

      const newId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      return saveProject(
        newId,
        `${imported.name} (Imported)`,
        imported.data,
        imported.description
      )
    } catch (error) {
      console.error('Failed to import project:', error)
      return null
    }
  }, [saveProject])

  const generateProjectId = useCallback((): string => {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  return {
    listProjects,
    saveProject,
    loadProject,
    deleteProject,
    duplicateProject,
    exportProjectAsJSON,
    importProjectFromJSON,
    generateProjectId,
  }
}
