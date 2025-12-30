import { extname } from 'path'

export interface StubLocation {
  file: string
  line: number
  type:
    | 'placeholder-return'
    | 'not-implemented'
    | 'empty-body'
    | 'todo-comment'
    | 'console-log-only'
    | 'placeholder-render'
    | 'mock-data'
    | 'stub-component'
  name: string
  severity: 'high' | 'medium' | 'low'
  code: string
}

export const STUB_PATTERNS = [
  {
    name: 'Not implemented error',
    pattern: /throw\s+new\s+Error\s*\(\s*['"]not\s+implemented/i,
    type: 'not-implemented' as const,
    severity: 'high' as const,
    description: 'Function throws "not implemented"'
  },
  {
    name: 'TODO comment in function',
    pattern: /\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*XXX|\/\/\s*HACK/i,
    type: 'todo-comment' as const,
    severity: 'medium' as const,
    description: 'Function has TODO/FIXME comment'
  },
  {
    name: 'Console.log only',
    pattern:
      /function\s+\w+[^{]*{\s*console\.(log|debug)\s*\([^)]*\)\s*}|const\s+\w+\s*=\s*[^=>\s]*=>\s*console\.(log|debug)/,
    type: 'console-log-only' as const,
    severity: 'high' as const,
    description: 'Function only logs to console'
  },
  {
    name: 'Return null/undefined stub',
    pattern: /return\s+(null|undefined)|return\s*;(?=\s*})/,
    type: 'placeholder-return' as const,
    severity: 'low' as const,
    description: 'Function only returns null/undefined'
  },
  {
    name: 'Return mock data',
    pattern: /return\s+(\{[^}]*\}|\[[^\]]*\])\s*\/\/\s*(mock|stub|placeholder|example)/i,
    type: 'mock-data' as const,
    severity: 'medium' as const,
    description: 'Function returns hardcoded mock data'
  },
  {
    name: 'Placeholder text in JSX',
    pattern: /<[A-Z]\w*[^>]*>\s*(placeholder|TODO|FIXME|stub|mock|example|not implemented)/i,
    type: 'placeholder-render' as const,
    severity: 'medium' as const,
    description: 'Component renders placeholder text'
  },
  {
    name: 'Empty component body',
    pattern:
      /export\s+(?:default\s+)?(?:function|const)\s+(\w+).*?\{[\s\n]*return\s+<[^>]+>\s*<\/[^>]+>\s*;?[\s\n]*\}/,
    type: 'stub-component' as const,
    severity: 'high' as const,
    description: 'Component has empty/minimal body'
  }
]

export const isCodeFile = (file: string): boolean =>
  ['.ts', '.tsx', '.js', '.jsx'].includes(extname(file))

export const severityOrder: Record<'high' | 'medium' | 'low', number> = {
  high: 0,
  medium: 1,
  low: 2
}
