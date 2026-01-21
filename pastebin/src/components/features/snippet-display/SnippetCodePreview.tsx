import { strings } from '@/lib/config'

interface SnippetCodePreviewProps {
  displayCode: string
  isTruncated: boolean
}

export function SnippetCodePreview({ displayCode, isTruncated }: SnippetCodePreviewProps) {
  return (
    <div className="rounded-md bg-secondary/30 p-3 border border-border" data-testid="snippet-code-preview">
      <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words font-mono" data-testid="code-preview-content">
        {displayCode}
      </pre>
      {isTruncated && (
        <p className="text-xs text-accent mt-2" role="status" data-testid="code-truncated-notice">
          {strings.snippetCard.viewFullCode}
        </p>
      )}
    </div>
  )
}
