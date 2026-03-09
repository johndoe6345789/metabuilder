import { useState } from 'react'
import { Button, Menu, MenuItem, MaterialIcon } from '@metabuilder/components/fakemui'
import { Namespace } from '@/lib/types'
import { useTranslation } from '@/hooks/useTranslation'
import styles from './selection-controls.module.scss'

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
  const t = useTranslation()
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const isAllSelected = selectedIds.length === totalFilteredCount

  return (
    <div className={styles.container} data-testid="selection-controls" role="region" aria-label="Selection controls">
      <Button
        variant="outlined"
        size="sm"
        onClick={onSelectAll}
        data-testid="select-all-btn"
        aria-label={isAllSelected ? t.selectionControls.deselectAllAria : t.selectionControls.selectAllAria}
      >
        {isAllSelected ? t.selectionControls.deselectAll : t.selectionControls.selectAll}
      </Button>
      {selectedIds.length > 0 && (
        <>
          <span className={styles.count} data-testid="selection-count" role="status" aria-live="polite">
            {t.selectionControls.selected.replace('{count}', String(selectedIds.length))}
          </span>
          <Button
            variant="outlined"
            size="sm"
            className={styles.moveBtn}
            onClick={(e) => setMenuAnchor(e.currentTarget)}
            data-testid="bulk-move-menu-trigger"
            aria-label={t.selectionControls.moveToAria}
            aria-haspopup="menu"
          >
            <MaterialIcon name="folder_open" size={16} aria-hidden="true" />
            {t.selectionControls.moveTo}
          </Button>
          <Menu
            open={Boolean(menuAnchor)}
            anchorEl={menuAnchor}
            onClose={() => setMenuAnchor(null)}
            data-testid="bulk-move-menu"
          >
            {namespaces.map((namespace) => (
              <MenuItem
                key={namespace.id}
                onClick={() => { onBulkMove(namespace.id); setMenuAnchor(null) }}
                disabled={namespace.id === currentNamespaceId}
                data-testid={`bulk-move-to-namespace-${namespace.id}`}
              >
                {namespace.name} {namespace.isDefault && t.common.default}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </div>
  )
}
