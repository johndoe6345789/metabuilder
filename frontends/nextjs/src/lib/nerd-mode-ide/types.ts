export type FileNodeType = 'file' | 'folder'

export interface FileNode {
  id: string
  name: string
  type: FileNodeType
  content?: string
  language?: string
  children?: FileNode[]
  expanded?: boolean
  exportPath?: string
}

export interface FileEntry {
  path: string
  content: string
}

export interface PackageTemplate {
  id: string
  name: string
  description: string
  rootName: string
  tree: FileNode[]
  tags?: string[]
}

export interface PackageTemplateConfig {
  id: string
  name: string
  description: string
  rootName: string
  packageId: string
  author: string
  version: string
  category: string
  summary: string
  components: Array<Record<string, unknown>>
  examples: Record<string, unknown>
  luaScripts: Array<{
    fileName: string
    description: string
    code: string
  }>
  tags?: string[]
}

export interface ReactAppTemplateConfig {
  id: string
  name: string
  description: string
  rootName: string
  tags?: string[]
}
