import type { useDebugger } from '@/hooks/useDebugger'

export type FileList = { name: string; content: string }[]
export type Debugger = ReturnType<typeof useDebugger>
export interface InlineValue {
  line: number
  text: string
}
