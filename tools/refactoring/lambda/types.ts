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
}

export interface AstExtractedFunction {
  name: string
  fullText: string
  isExported: boolean
  isAsync: boolean
  leadingComments: string
  startPos: number
  endPos: number
}

export interface ExtractedImport {
  fullText: string
  moduleSpecifier: string
  namedImports: string[]
}
