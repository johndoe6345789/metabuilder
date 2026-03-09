import { SnippetCard } from '@/components/features/snippet-display/SnippetCard'
import { Snippet } from '@/lib/types'
import styles from './snippet-grid.module.scss'

interface SnippetGridProps {
  snippets: Snippet[]
  onView: (snippet: Snippet) => void
  onEdit: (snippet: Snippet) => void
  onDelete: (id: string) => void
  onCopy: (code: string) => void
  onMove: () => void
  selectionMode: boolean
  selectedIds: string[]
  onToggleSelect: (id: string) => void
}

export function SnippetGrid({
  snippets,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onMove,
  selectionMode,
  selectedIds,
  onToggleSelect,
}: SnippetGridProps) {
  return (
    <div
      className={styles.grid}
      data-testid="snippet-grid"
      role="region"
      aria-label="Snippets list"
    >
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onCopy={onCopy}
          onMove={onMove}
          selectionMode={selectionMode}
          isSelected={selectedIds.includes(snippet.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  )
}
