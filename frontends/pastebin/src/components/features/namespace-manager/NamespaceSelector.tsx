import { MaterialIcon } from '@metabuilder/components/m3'
import { CreateNamespaceDialog } from './CreateNamespaceDialog'
import { DeleteNamespaceDialog } from './DeleteNamespaceDialog'
import { NamespaceChip } from './NamespaceChip'
import { useNamespaceSelector } from './hooks/useNamespaceSelector'
import styles from './namespace-selector.module.scss'

interface NamespaceSelectorProps {
  selectedNamespaceId: string | null
  onNamespaceChange: (namespaceId: string) => void
}

export function NamespaceSelector({
  selectedNamespaceId,
  onNamespaceChange,
}: NamespaceSelectorProps) {
  const vm = useNamespaceSelector({ selectedNamespaceId, onNamespaceChange })

  return (
    <div
      className={styles.bar}
      data-testid="namespace-selector"
      role="group"
      aria-label="Namespace selector"
    >
      {vm.namespaces.map(namespace => (
        <NamespaceChip
          key={namespace.id}
          namespace={namespace}
          isActive={namespace.id === selectedNamespaceId}
          isEditing={vm.editingId === namespace.id}
          editingName={vm.editingName}
          renameInputRef={vm.renameInputRef}
          onSelect={() => onNamespaceChange(namespace.id)}
          onEditingChange={vm.setEditingName}
          onRenameKeyDown={vm.handleRenameKeyDown}
          onRenameBlur={vm.commitRename}
          onStartEdit={vm.startEditing}
          onDeleteOpen={ns => {
            vm.setNamespaceToDelete(ns)
            vm.setDeleteDialogOpen(true)
          }}
        />
      ))}

      <button
        className={styles.addBtn}
        onClick={() => vm.setCreateDialogOpen(true)}
        data-testid="create-namespace-trigger"
        aria-label="Create new namespace"
      >
        <MaterialIcon name="add" size={16} aria-hidden="true" />
      </button>

      <CreateNamespaceDialog
        open={vm.createDialogOpen}
        onOpenChange={vm.setCreateDialogOpen}
        namespaceName={vm.newNamespaceName}
        onNamespaceNameChange={vm.setNewNamespaceName}
        onCreateNamespace={vm.handleCreateNamespace}
        loading={vm.loading}
      />

      <DeleteNamespaceDialog
        open={vm.deleteDialogOpen}
        onOpenChange={vm.setDeleteDialogOpen}
        namespace={vm.namespaceToDelete}
        onDeleteNamespace={vm.handleDeleteNamespace}
        loading={vm.loading}
      />
    </div>
  )
}
