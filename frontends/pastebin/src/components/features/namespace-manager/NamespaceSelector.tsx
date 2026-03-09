import { useState, useCallback, useRef } from 'react'
import { MaterialIcon } from '@metabuilder/components/fakemui'
import { toast } from '@metabuilder/components/fakemui'
import { Namespace } from '@/lib/types'
import {
  getSnippetsByNamespace,
  bulkMoveSnippets,
} from '@/lib/db'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  createNamespace,
  deleteNamespace,
  updateNamespace,
} from '@/store/slices/namespacesSlice'
import { CreateNamespaceDialog } from './CreateNamespaceDialog'
import { DeleteNamespaceDialog } from './DeleteNamespaceDialog'
import styles from './namespace-selector.module.scss'

interface NamespaceSelectorProps {
  selectedNamespaceId: string | null
  onNamespaceChange: (namespaceId: string) => void
}

export function NamespaceSelector({ selectedNamespaceId, onNamespaceChange }: NamespaceSelectorProps) {
  const t = useTranslation()
  const dispatch = useAppDispatch()
  const namespaces = useAppSelector(state => state.namespaces.items)

  const [newNamespaceName, setNewNamespaceName] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [namespaceToDelete, setNamespaceToDelete] = useState<Namespace | null>(null)
  const [loading, setLoading] = useState(false)

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)

  const handleCreateNamespace = async () => {
    if (!newNamespaceName.trim()) {
      toast.error(t.namespace.selector.enterName)
      return
    }
    setLoading(true)
    try {
      await dispatch(createNamespace(newNamespaceName.trim())).unwrap()
      setNewNamespaceName('')
      setCreateDialogOpen(false)
      toast.success(t.namespace.selector.created)
    } catch (error) {
      console.error('Failed to create namespace:', error)
      toast.error(t.namespace.selector.failedToCreate)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNamespace = async () => {
    if (!namespaceToDelete) return
    const defaultNamespace = namespaces.find(n => n.isDefault)
    if (!defaultNamespace) {
      toast.error(t.namespace.selector.noDefault)
      return
    }
    setLoading(true)
    try {
      const snippetsToMove = await getSnippetsByNamespace(namespaceToDelete.id)
      if (snippetsToMove.length > 0) {
        await bulkMoveSnippets(snippetsToMove.map(s => s.id), defaultNamespace.id)
      }
      await dispatch(deleteNamespace(namespaceToDelete.id)).unwrap()
      if (selectedNamespaceId === namespaceToDelete.id) onNamespaceChange(defaultNamespace.id)
      setDeleteDialogOpen(false)
      setNamespaceToDelete(null)
      const movedCount = snippetsToMove.length
      toast.success(
        movedCount > 0
          ? t.namespace.selector.deletedWithMoved.replace('{count}', String(movedCount))
          : t.namespace.selector.deleted
      )
    } catch (error) {
      console.error('Failed to delete namespace:', error)
      toast.error(t.namespace.selector.failedToDelete)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = useCallback((namespace: Namespace) => {
    setEditingId(namespace.id)
    setEditingName(namespace.name)
    // Focus the input after render
    setTimeout(() => renameInputRef.current?.select(), 0)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingId(null)
    setEditingName('')
  }, [])

  const commitRename = useCallback(async (id: string) => {
    const trimmed = editingName.trim()
    if (!trimmed) {
      cancelEditing()
      return
    }
    const original = namespaces.find(n => n.id === id)
    if (original && trimmed === original.name) {
      cancelEditing()
      return
    }
    try {
      await dispatch(updateNamespace({ id, name: trimmed })).unwrap()
    } catch (error) {
      console.error('Failed to rename namespace:', error)
      toast.error(t.namespace.selector.failedToCreate)
    } finally {
      cancelEditing()
    }
  }, [editingName, namespaces, dispatch, cancelEditing, t])

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitRename(id)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      cancelEditing()
    }
  }, [commitRename, cancelEditing])

  return (
    <div className={styles.bar} data-testid="namespace-selector" role="group" aria-label="Namespace selector">
      {namespaces.map(namespace => {
        const isActive = namespace.id === selectedNamespaceId
        const isEditing = editingId === namespace.id

        return (
          <div
            key={namespace.id}
            role="button"
            tabIndex={0}
            className={isActive ? styles.chipActive : styles.chip}
            onClick={() => !isEditing && onNamespaceChange(namespace.id)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !isEditing && onNamespaceChange(namespace.id) } }}
            data-testid={`namespace-chip-${namespace.id}`}
            aria-pressed={isActive}
            aria-label={`Switch to ${namespace.name} namespace`}
          >
            {isActive && !isEditing && <MaterialIcon name="folder" size={14} aria-hidden="true" />}

            {isEditing ? (
              <span className={styles.renameRow} onClick={e => e.stopPropagation()}>
                <input
                  ref={renameInputRef}
                  className={styles.renameInput}
                  value={editingName}
                  onChange={e => setEditingName(e.target.value)}
                  onKeyDown={e => handleRenameKeyDown(e, namespace.id)}
                  onBlur={() => commitRename(namespace.id)}
                  autoFocus
                  aria-label={`Rename namespace ${namespace.name}`}
                />
                <button
                  className={styles.renameConfirmBtn}
                  onClick={e => { e.stopPropagation(); commitRename(namespace.id) }}
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
                onClick={(e) => {
                  e.stopPropagation()
                  startEditing(namespace)
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
                onClick={(e) => {
                  e.stopPropagation()
                  setNamespaceToDelete(namespace)
                  setDeleteDialogOpen(true)
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
      })}

      <button
        className={styles.addBtn}
        onClick={() => setCreateDialogOpen(true)}
        data-testid="create-namespace-trigger"
        aria-label="Create new namespace"
      >
        <MaterialIcon name="add" size={16} aria-hidden="true" />
      </button>

      <CreateNamespaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        namespaceName={newNamespaceName}
        onNamespaceNameChange={setNewNamespaceName}
        onCreateNamespace={handleCreateNamespace}
        loading={loading}
      />

      <DeleteNamespaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        namespace={namespaceToDelete}
        onDeleteNamespace={handleDeleteNamespace}
        loading={loading}
      />
    </div>
  )
}
