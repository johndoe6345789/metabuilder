import { Button, MaterialIcon } from '@metabuilder/components/m3'
import { Namespace } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import { useSnippetCardActions } from './hooks/useSnippetCardActions'
import { MoveToMenu } from './MoveToMenu'
import styles from './snippet-card-actions.module.scss'

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
  const t = useTranslation()
  const vm = useSnippetCardActions()

  return (
    <div
      className={`${styles.actionsRow} flex items-center justify-between gap-2`}
      data-testid="snippet-card-actions"
      role="group"
      aria-label="Snippet actions"
    >
      <div className={styles.actionsLeft}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onView}
          className={styles.btnGap}
          data-testid="snippet-card-view-btn"
          aria-label="View snippet"
        >
          <MaterialIcon name="visibility" size={16} aria-hidden="true" />
          <span className={styles.btnLabelInline}>
            {t.snippetCard.viewButton}
          </span>
        </Button>
      </div>

      <div className={styles.actionsRight}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className={styles.btnGap}
          data-testid="snippet-card-copy-btn"
          aria-label={t.snippetCard.ariaLabels.copy}
        >
          <MaterialIcon name="content_copy" size={16} aria-hidden="true" />
          <span className={styles.btnLabelInline}>
            {isCopied ? t.snippetCard.copiedButton : t.snippetCard.copyButton}
          </span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={`${styles.btnSquare} h-4 w-4`}
          data-testid="snippet-card-edit-btn"
          aria-label={t.snippetCard.ariaLabels.edit}
        >
          <MaterialIcon name="edit" size={16} aria-hidden="true" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={e => {
            e.stopPropagation()
            vm.openMenu(e.currentTarget)
          }}
          className={styles.btnSquare}
          data-testid="snippet-card-actions-menu"
          aria-label="More options"
          aria-haspopup="menu"
        >
          <MaterialIcon name="more_horiz" size={16} aria-hidden="true" />
        </Button>

        <MoveToMenu
          open={Boolean(vm.menuAnchor)}
          anchorEl={vm.menuAnchor}
          isMoving={isMoving}
          availableNamespaces={availableNamespaces}
          onClose={vm.closeMenu}
          onMove={onMoveToNamespace}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
