export interface DockerError {
  id: string
  type: string
  message: string
  stage?: string
  exitCode?: number
  context: string[]
  severity: 'critical' | 'warning' | 'info'
}

export interface Solution {
  title: string
  description: string
  steps: string[]
  code?: string
  codeLanguage?: string
}

export interface KnowledgeBaseItem {
  id: string
  category: string
  title: string
  pattern: string
  explanation: string
  solutions: Solution[]
}
