import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Copy, Pencil, Trash, Eye, DotsThree, FolderOpen } from '@phosphor-icons/react'
import { Namespace } from '@/lib/types'
import { strings } from '@/lib/config'

interface SnippetCardActionsProps {
  isCopied: boolean
  isMoving: boolean
  availableNamespaces: Namespace[]
  onView: (e: React.MouseEvent) => void
  onCopy: (e: React.MouseEvent) => void
  onEdit: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  onMoveToNamespace: (namespaceId: string) => void
}

export function SnippetCardActions({
  isCopied,
  isMoving,
  availableNamespaces,
  onView,
  onCopy,
  onEdit,
  onDelete,
  onMoveToNamespace,
}: SnippetCardActionsProps) {
  return (
    <div className="flex items-center justify-between gap-2 pt-2" data-testid="snippet-card-actions" role="group" aria-label="Snippet actions">
      <div className="flex-1 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className="gap-2"
          data-testid="snippet-card-view-btn"
          aria-label="View snippet"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          {strings.snippetCard.viewButton}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="gap-2"
          data-testid="snippet-card-copy-btn"
          aria-label={strings.snippetCard.ariaLabels.copy}
        >
          <Copy className="h-4 w-4" aria-hidden="true" />
          {isCopied ? strings.snippetCard.copiedButton : strings.snippetCard.copyButton}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          data-testid="snippet-card-edit-btn"
          aria-label={strings.snippetCard.ariaLabels.edit}
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
              data-testid="snippet-card-actions-menu"
              aria-label="More options"
              aria-haspopup="menu"
            >
              <DotsThree className="h-4 w-4" weight="bold" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()} data-testid="snippet-actions-menu-content">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger
                disabled={isMoving || availableNamespaces.length === 0}
                data-testid="snippet-card-move-submenu"
                aria-label="Move snippet to another namespace"
              >
                <FolderOpen className="h-4 w-4 mr-2" aria-hidden="true" />
                <span>Move to...</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent data-testid="move-to-namespaces-list">
                {availableNamespaces.length === 0 ? (
                  <DropdownMenuItem disabled data-testid="no-namespaces-item">
                    No other namespaces
                  </DropdownMenuItem>
                ) : (
                  availableNamespaces.map((namespace) => (
                    <DropdownMenuItem
                      key={namespace.id}
                      onClick={() => onMoveToNamespace(namespace.id)}
                      data-testid={`move-to-namespace-${namespace.id}`}
                      aria-label={`Move to ${namespace.name}${namespace.isDefault ? ' (Default)' : ''}`}
                    >
                      {namespace.name}
                      {namespace.isDefault && (
                        <span className="ml-2 text-xs text-muted-foreground">(Default)</span>
                      )}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
              data-testid="snippet-card-delete-btn"
              aria-label="Delete snippet"
            >
              <Trash className="h-4 w-4 mr-2" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
