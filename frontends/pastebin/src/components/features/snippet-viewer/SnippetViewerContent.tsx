import { Snippet } from '@/lib/types'
import { MonacoEditor } from '@/components/features/snippet-editor/MonacoEditor'
import { SnippetPreviewContent } from './SnippetPreviewContent'
import styles from './snippet-viewer.module.scss'

interface SnippetViewerContentProps {
  snippet: Snippet
  canPreview: boolean
  showPreview: boolean
  isPython: boolean
  wordWrap?: 'on' | 'off'
  onChange?: (value: string) => void
  breakpoints?: number[]
  onToggleBreakpoint?: (line: number) => void
  currentDebugLine?: number | null
  inlineValues?: { line: number; text: string }[]
}

export function SnippetViewerContent({
  snippet,
  canPreview,
  showPreview,
  isPython,
  wordWrap = 'on',
  onChange = () => {},
  breakpoints,
  onToggleBreakpoint,
  currentDebugLine,
  inlineValues,
}: SnippetViewerContentProps) {
  if (canPreview && showPreview) {
    return (
      <SnippetPreviewContent
        snippet={snippet}
        isPython={isPython}
        wordWrap={wordWrap}
        onChange={onChange}
        breakpoints={breakpoints}
        onToggleBreakpoint={onToggleBreakpoint}
        currentDebugLine={currentDebugLine}
        inlineValues={inlineValues}
      />
    )
  }

  return (
    <div
      className={styles.fullPane}
      data-testid="viewer-code-full"
      role="region"
      aria-label="Code editor"
    >
      <MonacoEditor
        value={snippet.code}
        onChange={onChange}
        language={snippet.language}
        height="100%"
        wordWrap={wordWrap}
        breakpoints={breakpoints}
        onToggleBreakpoint={onToggleBreakpoint}
        currentDebugLine={currentDebugLine}
        inlineValues={inlineValues}
      />
    </div>
  )
}
