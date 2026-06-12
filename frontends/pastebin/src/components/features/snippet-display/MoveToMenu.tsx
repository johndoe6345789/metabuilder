import {
  Menu,
  MenuItem,
  Divider,
  MaterialIcon,
} from '@metabuilder/components/fakemui'
import { Namespace } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './snippet-card-actions.module.scss'

interface MoveToMenuProps {
  open: boolean
  anchorEl: Element | null
  isMoving: boolean
  availableNamespaces: Namespace[]
  onClose: () => void
  onMove: (namespaceId: string) => void
  onDelete: (e: React.MouseEvent) => void
}

export function MoveToMenu({
  open,
  anchorEl,
  isMoving,
  availableNamespaces,
  onClose,
  onMove,
  onDelete,
}: MoveToMenuProps) {
  const t = useTranslation()

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      data-testid="snippet-actions-menu-content"
      onClick={e => e.stopPropagation()}
    >
      <div
        data-testid="snippet-card-move-submenu"
        aria-label="Move snippet to another namespace"
        {...(availableNamespaces.length === 0 || isMoving
          ? { disabled: true }
          : {})}
      >
        <MenuItem disabled className={styles.menuLabel} aria-hidden="true">
          <MaterialIcon
            name="folder_open"
            size={16}
            style={{ marginRight: 8 }}
            aria-hidden="true"
          />
          {t.snippetCard.moveTo}
        </MenuItem>
        <div data-testid="move-to-namespaces-list">
          {availableNamespaces.length === 0 ? (
            <MenuItem disabled data-testid="no-namespaces-item">
              {t.snippetCard.noOtherNamespaces}
            </MenuItem>
          ) : (
            availableNamespaces.map(ns => (
              <MenuItem
                key={ns.id}
                onClick={() => {
                  onMove(ns.id)
                  onClose()
                }}
                data-testid={`move-to-namespace-${ns.id}`}
                disabled={isMoving}
                // eslint-disable-next-line max-len
                aria-label={`Move to ${ns.name}${ns.isDefault ? ' (Default)' : ''}`}
              >
                {ns.name}
                {ns.isDefault && (
                  <span className={styles.defaultBadge}>
                    {t.common.default}
                  </span>
                )}
              </MenuItem>
            ))
          )}
        </div>
      </div>
      <Divider />
      <MenuItem
        onClick={e => {
          e.stopPropagation()
          onDelete(e)
          onClose()
        }}
        className={`${styles.deleteItem} text-destructive`}
        data-testid="snippet-card-delete-btn"
        aria-label={t.snippetCard.ariaLabels.delete}
      >
        <MaterialIcon
          name="delete"
          size={16}
          style={{ marginRight: 8 }}
          aria-hidden="true"
        />
        {t.common.delete}
      </MenuItem>
    </Menu>
  )
}
