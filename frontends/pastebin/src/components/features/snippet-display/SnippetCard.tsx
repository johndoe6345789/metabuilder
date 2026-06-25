import { Card } from '@metabuilder/components/m3'
import { Snippet } from '@/lib/types'
import { SnippetCardHeader } from './SnippetCardHeader'
import { SnippetCodePreview } from './SnippetCodePreview'
import { SnippetCardActions } from './SnippetCardActions'
import { SnippetDeleteDialog } from './SnippetDeleteDialog'
import { useSnippetCard } from './hooks/useSnippetCard'
import styles from './snippet-card.module.scss'

interface SnippetCardProps {
  snippet: Snippet
  onEdit: (snippet: Snippet) => void
  onDelete: (id: string) => void
  onCopy: (code: string) => void
  onView: (snippet: Snippet) => void
  onMove?: () => void
  selectionMode?: boolean
  isSelected?: boolean
  onToggleSelect?: (id: string) => void
}

export function SnippetCard({
  snippet,
  onEdit,
  onDelete,
  onCopy,
  onView,
  onMove,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: SnippetCardProps) {
  const vm = useSnippetCard({
    snippet,
    onCopy,
    onMove,
    onToggleSelect,
    selectionMode,
    onView,
  })

  if (!snippet) {
    return (
      <Card role="article">
        <p className={styles.errorText}>{vm.t.snippetCard.errorMessage}</p>
      </Card>
    )
  }

  return (
    <Card
      className={`${styles.card} group transition-all cursor-pointer${
        isSelected ? ` border-accent ${styles.cardSelected}` : ''
      }`}
      onClick={vm.handleView}
      data-testid={`snippet-card-${snippet.id}`}
      role="article"
      aria-selected={isSelected}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          vm.handleView(e as unknown as React.MouseEvent)
        }
      }}
    >
      <div className={styles.cardBody}>
        <SnippetCardHeader
          snippet={snippet}
          description={vm.snippetData.description}
          selectionMode={selectionMode}
          isSelected={isSelected}
          onToggleSelect={vm.handleToggleSelect}
        />
        <SnippetCodePreview
          displayCode={vm.snippetData.displayCode}
          isTruncated={vm.snippetData.isTruncated}
        />
        {!selectionMode && (
          <SnippetCardActions
            isCopied={vm.isCopied}
            isMoving={vm.isMoving}
            availableNamespaces={vm.availableNamespaces}
            onView={vm.handleView}
            onCopy={vm.handleCopy}
            onEdit={e => {
              e.stopPropagation()
              onEdit(snippet)
            }}
            onDelete={e => {
              e.stopPropagation()
              vm.setDeleteConfirmOpen(true)
            }}
            onMoveToNamespace={vm.handleMoveToNamespace}
          />
        )}
      </div>

      <SnippetDeleteDialog
        open={vm.deleteConfirmOpen}
        snippetTitle={snippet.title}
        onCancel={() => vm.setDeleteConfirmOpen(false)}
        onConfirm={() => {
          vm.setDeleteConfirmOpen(false)
          onDelete(snippet.id)
        }}
      />
    </Card>
  )
}
