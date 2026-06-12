import { Snippet } from '@/lib/types'
import { MonacoEditor } from '@/components/features/snippet-editor/MonacoEditor'
import { ReactPreview } from '@/components/features/snippet-editor/ReactPreview'
import { PythonOutput } from '@/components/features/python-runner/PythonOutput'
import styles from './snippet-viewer.module.scss'

interface Props {
  snippet: Snippet
  isPython: boolean
  wordWrap?: 'on' | 'off'
  onChange?: (value: string) => void
  breakpoints?: number[]
  onToggleBreakpoint?: (line: number) => void
  currentDebugLine?: number | null
}

export function SnippetPreviewContent({
  snippet, isPython, wordWrap = 'on', onChange = () => {},
  breakpoints, onToggleBreakpoint, currentDebugLine,
}: Props) {
  return (
    <>
      <div className={styles.codePane} data-testid="viewer-code-pane"
        role="region" aria-label="Code editor">
        <MonacoEditor
          value={snippet.code} onChange={onChange}
          language={snippet.language} height="100%"
          wordWrap={wordWrap} breakpoints={breakpoints}
          onToggleBreakpoint={onToggleBreakpoint}
          currentDebugLine={currentDebugLine}
        />
      </div>
      <div className={styles.previewPane}
        data-testid="viewer-preview-pane" role="region"
        aria-label={
          `Preview pane - ${isPython ? 'Python output' : 'React preview'}`
        }
      >
        {isPython ? (
          <PythonOutput code={snippet.code} />
        ) : (
          <ReactPreview
            code={snippet.code} language={snippet.language}
            functionName={snippet.functionName}
            inputParameters={snippet.inputParameters}
          />
        )}
      </div>
    </>
  )
}
