export interface GitConfig {
  provider: 'github' | 'gitlab'
  token: string
  repoUrl: string
  branch: string
}

export interface TestResult {
  name: string
  status: 'passed' | 'failed' | 'pending'
  duration?: number
  error?: string
}
