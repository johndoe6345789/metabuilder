import { Button } from '@/components/ui/button'
import { FolderOpen } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Namespace } from '@/lib/types'

interface SelectionControlsProps {
  selectedIds: string[]
  totalFilteredCount: number
  namespaces: Namespace[]
  currentNamespaceId: string | null
  onSelectAll: () => void
  onBulkMove: (namespaceId: string) => void
}

export function SelectionControls({
  selectedIds,
  totalFilteredCount,
  namespaces,
  currentNamespaceId,
  onSelectAll,
  onBulkMove,
}: SelectionControlsProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg" data-testid="selection-controls" role="region" aria-label="Selection controls">
      <Button
        variant="outline"
        size="sm"
        onClick={onSelectAll}
        data-testid="select-all-btn"
        aria-label={selectedIds.length === totalFilteredCount ? 'Deselect all snippets' : 'Select all snippets'}
      >
        {selectedIds.length === totalFilteredCount ? 'Deselect All' : 'Select All'}
      </Button>
      {selectedIds.length > 0 && (
        <>
          <span className="text-sm text-muted-foreground" data-testid="selection-count" role="status" aria-live="polite">
            {selectedIds.length} selected
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                data-testid="bulk-move-menu-trigger"
                aria-label="Move selected snippets to another namespace"
                aria-haspopup="menu"
              >
                <FolderOpen weight="bold" className="h-4 w-4" aria-hidden="true" />
                Move to...
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent data-testid="bulk-move-menu" aria-label="Namespace options for moving snippets">
              {namespaces.map((namespace) => (
                <DropdownMenuItem
                  key={namespace.id}
                  onClick={() => onBulkMove(namespace.id)}
                  disabled={namespace.id === currentNamespaceId}
                  data-testid={`bulk-move-to-namespace-${namespace.id}`}
                  aria-label={`Move to ${namespace.name}${namespace.isDefault ? ' (Default)' : ''}`}
                >
                  {namespace.name} {namespace.isDefault && '(Default)'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}
