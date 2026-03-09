export type AtomicLevel = 'atoms' | 'molecules' | 'organisms' | 'templates'

export interface InputParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue: string
  description?: string
}

export interface SnippetFile {
  name: string
  content: string
}

export interface Snippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  category: string
  namespaceId?: string
  hasPreview?: boolean
  isTemplate?: boolean
  functionName?: string
  inputParameters?: InputParameter[]
  files?: SnippetFile[]
  entryPoint?: string
  createdAt: number
  updatedAt: number
  shareToken?: string
}

export interface SnippetRevision {
  id: string
  snippetId: string
  code: string
  files?: SnippetFile[]
  createdAt: number
}

export interface Namespace {
  id: string
  name: string
  createdAt: number
  isDefault: boolean
  userId?: string
  tenantId?: string
}

export interface SnippetTemplate {
  id: string
  title: string
  description: string
  code: string
  language: string
  category: string
  hasPreview?: boolean
  functionName?: string
  inputParameters?: InputParameter[]
  files?: SnippetFile[]
  entryPoint?: string
}

export interface Comment {
  id: string
  authorId: string
  authorUsername: string
  content: string
  createdAt: number
}

export interface SnippetComment extends Comment {
  snippetId: string
  tenantId?: string
}

export interface ProfileComment extends Comment {
  profileUserId: string
  tenantId?: string
}
































