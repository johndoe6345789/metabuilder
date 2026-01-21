import { Snippet } from '@/lib/types'
import { MonacoEditor } from '@/components/features/snippet-editor/MonacoEditor'
import { ReactPreview } from '@/components/features/snippet-editor/ReactPreview'
import { PythonOutput } from '@/components/features/python-runner/PythonOutput'

interface SnippetViewerContentProps {
  snippet: Snippet
  canPreview: boolean
  showPreview: boolean
  isPython: boolean
}

export function SnippetViewerContent({
  snippet,
  canPreview,
  showPreview,
  isPython,
}: SnippetViewerContentProps) {
  if (canPreview && showPreview) {
    return (
      <>
        <div className="flex-1 overflow-hidden border-r border-border" data-testid="viewer-code-pane" role="region" aria-label="Code viewer">
          <MonacoEditor
            value={snippet.code}
            onChange={() => {}}
            language={snippet.language}
            height="100%"
            readOnly={true}
          />
        </div>
        <div className="flex-1 overflow-hidden" data-testid="viewer-preview-pane" role="region" aria-label={`Preview pane - ${isPython ? 'Python output' : 'React preview'}`}>
          {isPython ? (
            <PythonOutput code={snippet.code} />
          ) : (
            <ReactPreview
              code={snippet.code}
              language={snippet.language}
              functionName={snippet.functionName}
              inputParameters={snippet.inputParameters}
            />
          )}
        </div>
      </>
    )
  }

  return (
    <div className="flex-1 overflow-hidden" data-testid="viewer-code-full" role="region" aria-label="Full code viewer">
      <MonacoEditor
        value={snippet.code}
        onChange={() => {}}
        language={snippet.language}
        height="100%"
        readOnly={true}
      />
    </div>
  )
}
