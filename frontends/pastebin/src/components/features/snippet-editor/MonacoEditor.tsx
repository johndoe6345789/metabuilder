import { lazy, Suspense } from 'react'
import { Skeleton } from '@metabuilder/components/fakemui'
import { configureMonacoTypeScript, getMonacoLanguage } from '@/lib/monaco-config'
import type { Monaco } from '@monaco-editor/react'
import { useAppSelector } from '@/store/hooks'
import { selectTheme } from '@/store/selectors'

const Editor = lazy(() => import('@monaco-editor/react'))

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  height?: string
  readOnly?: boolean
  wordWrap?: 'on' | 'off'
}

function EditorLoadingSkeleton({ height = '400px' }: { height?: string }) {
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column', gap: 8 }} data-testid="monaco-editor-skeleton" role="status" aria-busy="true">
      <Skeleton style={{ flex: 1, width: '100%', borderRadius: 6 }} />
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
  readOnly = false,
  wordWrap = 'on',
}: MonacoEditorProps) {
  const monacoLanguage = getMonacoLanguage(language)
  const theme = useAppSelector(selectTheme)
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  return (
    <Suspense fallback={<EditorLoadingSkeleton height={height} />}>
      <div data-testid="monaco-editor-container" style={{ height }} role="region" aria-label={`Code editor (${readOnly ? 'read-only' : 'editable'}, ${monacoLanguage} language)`}>
        {/* Aria-live region for editor status updates */}
        <div
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
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
          theme={monacoTheme}
          beforeMount={handleEditorBeforeMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap,
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
