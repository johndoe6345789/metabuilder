import { lazy, Suspense } from 'react'
import {
  configureMonacoTypeScript,
  getMonacoLanguage,
} from '@/lib/monaco-config'
import type { Monaco } from '@monaco-editor/react'
import { useAppSelector } from '@/store/hooks'
import { selectTheme } from '@/store/selectors'
import { useMonacoDebugDecorations } from '@/hooks/useMonacoDebugDecorations'
import { EditorLoadingSkeleton, srOnly } from './EditorLoadingSkeleton'
import { buildEditorOptions } from './monaco-editor-options'
import type { MonacoEditorProps } from './monaco-editor.types'

const Editor = lazy(() => import('@monaco-editor/react'))

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
  breakpoints,
  onToggleBreakpoint,
  currentDebugLine,
  inlineValues,
}: MonacoEditorProps) {
  const monacoLanguage = getMonacoLanguage(language)
  const theme = useAppSelector(selectTheme)
  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs'

  const { onEditorMount } = useMonacoDebugDecorations({
    breakpoints,
    currentDebugLine,
    inlineValues,
    onToggleBreakpoint,
  })

  const editorLabel =
    `Code editor (${readOnly ? 'read-only' : 'editable'}` +
    `, ${monacoLanguage} language)`

  return (
    <Suspense fallback={<EditorLoadingSkeleton height={height} />}>
      <div
        data-testid="monaco-editor-container"
        style={{ height }}
        role="region"
        aria-label={editorLabel}
      >
        <div
          style={srOnly}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="monaco-editor-status"
        >
          {`Code editor loaded with ${monacoLanguage} syntax highlighting. `}
          {readOnly ? 'Read-only mode' : 'Editable mode'}.
        </div>
        <Editor
          height={height}
          language={monacoLanguage}
          value={value}
          onChange={newValue => onChange(newValue || '')}
          theme={monacoTheme}
          beforeMount={handleEditorBeforeMount}
          onMount={onEditorMount}
          options={buildEditorOptions({
            wordWrap,
            readOnly,
            glyphMargin: !!(
              onToggleBreakpoint ||
              breakpoints?.length ||
              currentDebugLine
            ),
          })}
        />
      </div>
    </Suspense>
  )
}
