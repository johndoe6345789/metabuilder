import { lazy, Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { configureMonacoTypeScript, getMonacoLanguage } from '@/lib/monaco-config'
import type { Monaco } from '@monaco-editor/react'

const Editor = lazy(() => import('@monaco-editor/react'))

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  readOnly?: boolean
}

function EditorLoadingSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div className="space-y-2" style={{ height }} data-testid="monaco-editor-skeleton" role="status" aria-busy="true">
      <Skeleton className="h-full w-full rounded-md" />
    </div>
  )
}

function handleEditorBeforeMount(monaco: Monaco) {
  configureMonacoTypeScript(monaco)
}

export function MonacoEditor({
  value,
  onChange,
  language,
  height = '400px',
  readOnly = false
}: MonacoEditorProps) {
  const monacoLanguage = getMonacoLanguage(language)

  return (
    <Suspense fallback={<EditorLoadingSkeleton height={height} />}>
      <div data-testid="monaco-editor-container" role="region" aria-label={`Code editor (${readOnly ? 'read-only' : 'editable'}, ${monacoLanguage} language)`}>
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
          onChange={(newValue) => onChange(newValue || '')}
          theme="vs-dark"
          beforeMount={handleEditorBeforeMount}
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
          }}
        />
      </div>
    </Suspense>
  )
}
