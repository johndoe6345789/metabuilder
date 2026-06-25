'use client'

import { lazy, Suspense, type ComponentType } from 'react'
// Use a simple skeleton div instead of the Skeleton component for cleaner loading state
import type { Monaco } from '@monaco-editor/react'

// Lazy load Monaco Editor for better performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Editor = lazy(() => import('@monaco-editor/react').then(mod => ({ default: mod.default as ComponentType<any> })))

/**
 * Language name to Monaco language ID mapping
 */
const LANGUAGE_MAP: Record<string, string> = {
  'JavaScript': 'javascript',
  'TypeScript': 'typescript',
  'JSX': 'javascript',
  'TSX': 'typescript',
  'Python': 'python',
  'Java': 'java',
  'C++': 'cpp',
  'C#': 'csharp',
  'Go': 'go',
  'Rust': 'rust',
  'PHP': 'php',
  'Ruby': 'ruby',
  'SQL': 'sql',
  'HTML': 'html',
  'CSS': 'css',
  'JSON': 'json',
  'YAML': 'yaml',
  'Markdown': 'markdown',
  'XML': 'xml',
  'Shell': 'shell',
  'Bash': 'shell',
}

/**
 * Get Monaco language ID from human-readable language name
 */
export function getMonacoLanguage(language: string): string {
  return LANGUAGE_MAP[language] || language.toLowerCase()
}

/**
 * Configure TypeScript support in Monaco Editor
 */
export function configureMonacoTypeScript(monaco: Monaco) {
  if (monaco.languages.typescript) {
    monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true)
  }
}

export interface MonacoEditorProps {
  /** Current editor value */
  value: string
  /** Called when editor value changes */
  onChange: (value: string) => void
  /** Programming language for syntax highlighting */
  language: string
  /** Editor height (CSS value) */
  height?: string
  /** Whether the editor is read-only */
  readOnly?: boolean
  /** Monaco theme */
  theme?: 'vs-dark' | 'light' | 'vs'
  /** Custom Monaco options */
  options?: Record<string, unknown>
  /** Called before Monaco mounts (for custom configuration) */
  beforeMount?: (monaco: Monaco) => void
  /** Test ID for the component */
  testId?: string
}

function EditorLoadingSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div
      className="animate-pulse bg-muted rounded-md"
      style={{ height }}
      data-testid="monaco-editor-skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading code editor"
    />
  )
}

/**
 * Monaco Editor wrapper component with lazy loading and TypeScript support.
 *
 * @example
 * ```tsx
 * <MonacoEditor
 *   value={code}
 *   onChange={setCode}
 *   language="TypeScript"
 *   height="400px"
 * />
 * ```
 */
export function MonacoEditor({
  value,
  onChange,
  language,
  height = '400px',
  readOnly = false,
  theme = 'vs-dark',
  options = {},
  beforeMount,
  testId,
}: MonacoEditorProps) {
  const monacoLanguage = getMonacoLanguage(language)

  const handleBeforeMount = (monaco: Monaco) => {
    configureMonacoTypeScript(monaco)
    beforeMount?.(monaco)
  }

  return (
    <Suspense fallback={<EditorLoadingSkeleton height={height} />}>
      <div
        data-testid={testId ?? "monaco-editor-container"}
        role="region"
        aria-label={`Code editor (${readOnly ? 'read-only' : 'editable'}, ${monacoLanguage} language)`}
      >
        {/* Aria-live region for editor status updates */}
        <div
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="monaco-editor-status"
        >
          Code editor loaded with {monacoLanguage} syntax highlighting. {readOnly ? 'Read-only mode' : 'Editable mode'}.
        </div>
        <Editor
          height={height}
          language={monacoLanguage}
          value={value}
          onChange={(newValue: string | undefined) => onChange(newValue || '')}
          theme={theme}
          beforeMount={handleBeforeMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            readOnly,
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              useShadows: false,
            },
            padding: {
              top: 12,
              bottom: 12,
            },
            fontFamily: 'JetBrains Mono, monospace',
            fontLigatures: true,
            ...options,
          }}
        />
      </div>
    </Suspense>
  )
}
