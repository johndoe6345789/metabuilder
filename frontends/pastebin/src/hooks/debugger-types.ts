export type DebugStatus =
  | 'idle'
  | 'starting'
  | 'running'
  | 'paused'
  | 'terminated'
  | 'error'

export interface DapStackFrame {
  id: number
  name: string
  source?: { name?: string; path?: string }
  line: number
  column: number
}

export interface DapScope {
  name: string
  variablesReference: number
  expensive: boolean
}

export interface DapVariable {
  name: string
  value: string
  type?: string
  variablesReference: number
}

export interface WatchEntry {
  expr: string
  value: string | null
  error?: string
}

export interface DebuggerState {
  status: DebugStatus
  error: string | null
  breakpoints: Record<string, number[]> // filename → 1-indexed line numbers
  currentFile: string | null
  currentLine: number | null
  threadId: number
  callStack: DapStackFrame[]
  scopes: DapScope[]
  variables: Record<number, DapVariable[]> // variablesReference → vars
  watches: WatchEntry[]
  output: { category: string; text: string }[]
}

export type DebuggerAction =
  | { type: 'START' }
  | { type: 'RUNNING' }
  | {
      type: 'PAUSED'
      threadId: number
      file: string | null
      line: number | null
    }
  | { type: 'TERMINATED' }
  | { type: 'ERROR'; error: string }
  | { type: 'CALL_STACK'; frames: DapStackFrame[] }
  | { type: 'SCOPES'; scopes: DapScope[] }
  | { type: 'VARIABLES'; ref: number; vars: DapVariable[] }
  | {
      type: 'WATCH_RESULT'
      index: number
      value: string | null
      error?: string
    }
  | { type: 'ADD_WATCH'; expr: string }
  | { type: 'REMOVE_WATCH'; index: number }
  | { type: 'TOGGLE_BP'; file: string; line: number }
  | { type: 'OUTPUT'; category: string; text: string }
  | { type: 'RESET' }
