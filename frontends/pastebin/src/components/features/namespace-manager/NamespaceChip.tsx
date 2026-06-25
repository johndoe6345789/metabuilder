import { MaterialIcon } from '@metabuilder/components/m3'
import type { Namespace } from '@/lib/types'
import styles from './namespace-selector.module.scss'

interface NamespaceChipProps {
  namespace: Namespace
  isActive: boolean
  isEditing: boolean
  editingName: string
  renameInputRef: React.RefObject<HTMLInputElement>
  onSelect: () => void
  onEditingChange: (v: string) => void
  onRenameKeyDown: (
    e: React.KeyboardEvent<HTMLInputElement>,
    id: string,
  ) => void
  onRenameBlur: (id: string) => void
  onStartEdit: (ns: Namespace) => void
  onDeleteOpen: (ns: Namespace) => void
}

export function NamespaceChip({
  namespace,
  isActive,
  isEditing,
  editingName,
  renameInputRef,
  onSelect,
  onEditingChange,
  onRenameKeyDown,
  onRenameBlur,
  onStartEdit,
  onDeleteOpen,
}: NamespaceChipProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={isActive ? styles.chipActive : styles.chip}
      onClick={() => !isEditing && onSelect()}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!isEditing) onSelect()
        }
      }}
      data-testid={`namespace-chip-${namespace.id}`}
      aria-pressed={isActive}
      aria-label={`Switch to ${namespace.name} namespace`}
    >
      {isActive && !isEditing && (
        <MaterialIcon name="folder" size={14} aria-hidden="true" />
      )}

      {isEditing ? (
        <span className={styles.renameRow} onClick={e => e.stopPropagation()}>
          <input
            ref={renameInputRef}
            className={styles.renameInput}
            value={editingName}
            onChange={e => onEditingChange(e.target.value)}
            onKeyDown={e => onRenameKeyDown(e, namespace.id)}
            onBlur={() => onRenameBlur(namespace.id)}
            autoFocus
            aria-label={`Rename namespace ${namespace.name}`}
          />
          <button
            className={styles.renameConfirmBtn}
            onClick={e => {
              e.stopPropagation()
              onRenameBlur(namespace.id)
            }}
            aria-label="Confirm rename"
            type="button"
          >
            <MaterialIcon name="check" size={12} aria-hidden="true" />
          </button>
        </span>
      ) : (
        <span>{namespace.name}</span>
      )}

      {!isEditing && !namespace.isDefault && (
        <button
          className={styles.chipEditBtn}
          onClick={e => {
            e.stopPropagation()
            onStartEdit(namespace)
          }}
          data-testid={`rename-namespace-${namespace.id}`}
          aria-label={`Rename ${namespace.name} namespace`}
          type="button"
        >
          <MaterialIcon name="edit" size={11} aria-hidden="true" />
        </button>
      )}

      {isActive && !namespace.isDefault && !isEditing && (
        <button
          className={styles.chipDeleteBtn}
          onClick={e => {
            e.stopPropagation()
            onDeleteOpen(namespace)
          }}
          data-testid="delete-namespace-trigger"
          aria-label={`Delete ${namespace.name} namespace`}
          type="button"
        >
          <MaterialIcon name="close" size={11} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
