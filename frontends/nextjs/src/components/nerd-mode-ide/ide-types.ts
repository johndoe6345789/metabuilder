export type FileNode = {
  name: string
  type: 'file' | 'folder'
  language?: string
  children?: FileNode[]
}

export type OpenFile = {
  path: string
  language: string
  content: string
}

export type ScriptEntry = {
  id: string
  name: string
  code: string
}
