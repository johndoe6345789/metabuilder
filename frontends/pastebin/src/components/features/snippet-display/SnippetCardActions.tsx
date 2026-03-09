import { useState } from 'react'
import { Button, Menu, MenuItem, Divider, MaterialIcon } from '@metabuilder/components/fakemui'
import { Namespace } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  return (
    <div className={`${styles.actionsRow} flex items-center justify-between gap-2`} data-testid="snippet-card-actions" role="group" aria-label="Snippet actions">
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
          <span className={styles.btnLabelInline}>{t.snippetCard.viewButton}</span>
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
          <span className={styles.btnLabelInline}>{isCopied ? t.snippetCard.copiedButton : t.snippetCard.copyButton}</span>
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
          onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget) }}
          className={styles.btnSquare}
          data-testid="snippet-card-actions-menu"
          aria-label="More options"
          aria-haspopup="menu"
        >
          <MaterialIcon name="more_horiz" size={16} aria-hidden="true" />
        </Button>

        <Menu
          open={Boolean(menuAnchor)}
          anchorEl={menuAnchor}
          onClose={() => setMenuAnchor(null)}
          data-testid="snippet-actions-menu-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            data-testid="snippet-card-move-submenu"
            aria-label="Move snippet to another namespace"
            {...((availableNamespaces.length === 0 || isMoving) ? { disabled: true } : {})}
          >
            <MenuItem
              disabled
              className={styles.menuLabel}
              aria-hidden="true"
            >
              <MaterialIcon name="folder_open" size={16} style={{ marginRight: 8 }} aria-hidden="true" />
              {t.snippetCard.moveTo}
            </MenuItem>
            <div data-testid="move-to-namespaces-list">
              {availableNamespaces.length === 0 ? (
                <MenuItem
                  disabled
                  data-testid="no-namespaces-item"
                >
                  {t.snippetCard.noOtherNamespaces}
                </MenuItem>
              ) : (
                availableNamespaces.map((namespace) => (
                  <MenuItem
                    key={namespace.id}
                    onClick={() => { onMoveToNamespace(namespace.id); setMenuAnchor(null) }}
                    data-testid={`move-to-namespace-${namespace.id}`}
                    disabled={isMoving}
                    aria-label={`Move to ${namespace.name}${namespace.isDefault ? ' (Default)' : ''}`}
                  >
                    {namespace.name}
                    {namespace.isDefault && (
                      <span className={styles.defaultBadge}>{t.common.default}</span>
                    )}
                  </MenuItem>
                ))
              )}
            </div>
          </div>
          <Divider />
          <MenuItem
            onClick={(e) => { e.stopPropagation(); onDelete(e); setMenuAnchor(null) }}
            className={`${styles.deleteItem} text-destructive`}
            data-testid="snippet-card-delete-btn"
            aria-label={t.snippetCard.ariaLabels.delete}
          >
            <MaterialIcon name="delete" size={16} style={{ marginRight: 8 }} aria-hidden="true" />
            {t.common.delete}
          </MenuItem>
        </Menu>
      </div>
    </div>
  )
}
