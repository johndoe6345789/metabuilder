"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DialogTitle } from '@/components/ui/dialog'
import { Copy, Pencil, Check, SplitVertical } from '@phosphor-icons/react'
import { Snippet } from '@/lib/types'
import { cn } from '@/lib/utils'
import { strings, LANGUAGE_COLORS } from '@/lib/config'

interface SnippetViewerHeaderProps {
  snippet: Snippet
  isCopied: boolean
  canPreview: boolean
  showPreview: boolean
  onCopy: () => void
  onEdit: () => void
  onTogglePreview: () => void
}

export function SnippetViewerHeader({
  snippet,
  isCopied,
  canPreview,
  showPreview,
  onCopy,
  onEdit,
  onTogglePreview,
}: SnippetViewerHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-3">
          <DialogTitle className="text-2xl font-bold truncate">
            {snippet.title}
          </DialogTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "shrink-0 border font-medium text-xs px-2 py-1",
              LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS['Other']
            )}
          >
            {snippet.language}
          </Badge>
        </div>
        {snippet.description && (
          <p className="text-sm text-muted-foreground">
            {snippet.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {strings.snippetViewer.lastUpdated}: {new Date(snippet.updatedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2 shrink-0" data-testid="viewer-header-actions" role="toolbar" aria-label="Snippet viewer actions">
        {canPreview && (
          <Button
            variant={showPreview ? "filled" : "outline"}
            size="sm"
            onClick={onTogglePreview}
            className="gap-2"
            data-testid="snippet-viewer-toggle-preview-btn"
            aria-pressed={showPreview}
            aria-label={showPreview ? "Hide preview" : "Show preview"}
          >
            <SplitVertical className="h-4 w-4" aria-hidden="true" />
            {showPreview ? strings.snippetViewer.buttons.hidePreview : strings.snippetViewer.buttons.showPreview}
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="gap-2"
          data-testid="snippet-viewer-copy-btn"
          aria-label={isCopied ? "Code copied to clipboard" : "Copy code to clipboard"}
          aria-live="polite"
        >
          {isCopied ? (
            <>
              <Check className="h-4 w-4" weight="bold" aria-hidden="true" />
              {strings.snippetViewer.buttons.copied}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              {strings.snippetViewer.buttons.copy}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="gap-2"
          data-testid="snippet-viewer-edit-btn"
          aria-label="Edit snippet"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          {strings.snippetViewer.buttons.edit}
        </Button>
      </div>
    </div>
  )
}
