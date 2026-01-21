/// <reference path="../global.d.ts" />

import { Project } from '@/types/project'

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

export class ProjectService {
  private static readonly PROJECTS_LIST_KEY = 'codeforge-projects-list'
  private static readonly PROJECT_PREFIX = 'codeforge-project-'

  static async listProjects(): Promise<SavedProject[]> {
    try {
      const projectIds = await window.spark.kv.get<string[]>(this.PROJECTS_LIST_KEY)
      if (!projectIds || projectIds.length === 0) {
        return []
      }

      const projects: SavedProject[] = []
      for (const id of projectIds) {
        const project = await this.loadProject(id)
        if (project) {
          projects.push(project)
        }
      }

      return projects.sort((a, b) => b.updatedAt - a.updatedAt)
    } catch (error) {
      console.error('Failed to list projects:', error)
      return []
    }
  }

  static async saveProject(
    id: string,
    name: string,
    projectData: Project,
    description?: string
  ): Promise<SavedProject> {
    const now = Date.now()
    
    const existingProject = await this.loadProject(id)
    
    const savedProject: SavedProject = {
      id,
      name,
      description,
      data: projectData,
      createdAt: existingProject?.createdAt || now,
      updatedAt: now,
      version: PROJECT_VERSION,
    }

    await window.spark.kv.set(`${this.PROJECT_PREFIX}${id}`, savedProject)

    const projectIds = (await window.spark.kv.get<string[]>(this.PROJECTS_LIST_KEY)) || []
    if (!projectIds.includes(id)) {
      projectIds.push(id)
      await window.spark.kv.set(this.PROJECTS_LIST_KEY, projectIds)
    }

    return savedProject
  }

  static async loadProject(id: string): Promise<SavedProject | null> {
    try {
      const project = await window.spark.kv.get<SavedProject>(`${this.PROJECT_PREFIX}${id}`)
      return project || null
    } catch (error) {
      console.error(`Failed to load project ${id}:`, error)
      return null
    }
  }

  static async deleteProject(id: string): Promise<void> {
    await window.spark.kv.delete(`${this.PROJECT_PREFIX}${id}`)

    const projectIds = (await window.spark.kv.get<string[]>(this.PROJECTS_LIST_KEY)) || []
    const updatedIds = projectIds.filter((pid) => pid !== id)
    await window.spark.kv.set(this.PROJECTS_LIST_KEY, updatedIds)
  }

  static async duplicateProject(id: string, newName: string): Promise<SavedProject | null> {
    const project = await this.loadProject(id)
    if (!project) {
      return null
    }

    const newId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const duplicated = await this.saveProject(
      newId,
      newName,
      project.data,
      project.description
    )

    return duplicated
  }

  static async exportProjectAsJSON(id: string): Promise<string | null> {
    const project = await this.loadProject(id)
    if (!project) {
      return null
    }

    return JSON.stringify(project, null, 2)
  }

  static async importProjectFromJSON(jsonString: string): Promise<SavedProject | null> {
    try {
      const imported = JSON.parse(jsonString) as SavedProject
      
      const newId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const project = await this.saveProject(
        newId,
        `${imported.name} (Imported)`,
        imported.data,
        imported.description
      )

      return project
    } catch (error) {
      console.error('Failed to import project:', error)
      return null
    }
  }

  static generateProjectId(): string {
    return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
