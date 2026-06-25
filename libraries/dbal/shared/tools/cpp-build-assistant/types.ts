export interface ExecResult {
  success: boolean
  output?: string
  error?: string
}

export interface ExecOptions {
  cwd?: string
  silent?: boolean
  args?: string[]
}
