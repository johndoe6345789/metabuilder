export type Language = 'typescript' | 'cpp'

export interface FunctionInfo {
  name: string
  isAsync: boolean
  isExported: boolean
  params: string
  returnType: string
  body: string
  startLine: number
  endLine: number
  comments: string[]
  isMethod: boolean
  isStatic: boolean
  isConst: boolean
  namespace?: string
  className?: string
}

export interface DependencyInfo {
  imports: string[]
  types: string[]
}

export interface RefactorResult {
  success: boolean
  originalFile: string
  newFiles: string[]
  errors: string[]
}
