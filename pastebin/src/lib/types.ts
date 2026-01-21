export type AtomicLevel = 'atoms' | 'molecules' | 'organisms' | 'templates'

export interface InputParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue: string
  description?: string
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
  createdAt: number
  updatedAt: number
}

export interface Namespace {
  id: string
  name: string
  createdAt: number
  isDefault: boolean
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
}
































