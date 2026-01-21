import { useState, useEffect, useCallback } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Folder } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Namespace } from '@/lib/types'
import {
  getAllNamespaces,
  createNamespace,
  deleteNamespace,
} from '@/lib/db'
import { CreateNamespaceDialog } from './CreateNamespaceDialog'
import { DeleteNamespaceDialog } from './DeleteNamespaceDialog'

interface NamespaceSelectorProps {
  selectedNamespaceId: string | null
  onNamespaceChange: (namespaceId: string) => void
}

export function NamespaceSelector({ selectedNamespaceId, onNamespaceChange }: NamespaceSelectorProps) {
  const [namespaces, setNamespaces] = useState<Namespace[]>([])
  const [newNamespaceName, setNewNamespaceName] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [namespaceToDelete, setNamespaceToDelete] = useState<Namespace | null>(null)
  const [loading, setLoading] = useState(false)

  const loadNamespaces = useCallback(async () => {
    try {
      const loadedNamespaces = await getAllNamespaces()
      setNamespaces(loadedNamespaces)
      
      if (!selectedNamespaceId && loadedNamespaces.length > 0) {
        const defaultNamespace = loadedNamespaces.find(n => n.isDefault)
        if (defaultNamespace) {
          onNamespaceChange(defaultNamespace.id)
        }
      }
    } catch (error) {
      console.error('Failed to load namespaces:', error)
      toast.error('Failed to load namespaces')
    }
  }, [onNamespaceChange, selectedNamespaceId])

  useEffect(() => {
    loadNamespaces()
  }, [loadNamespaces])

  const handleCreateNamespace = async () => {
    if (!newNamespaceName.trim()) {
      toast.error('Please enter a namespace name')
      return
    }

    setLoading(true)
    try {
      const newNamespace: Namespace = {
        id: Date.now().toString(),
        name: newNamespaceName.trim(),
        createdAt: Date.now(),
        isDefault: false,
      }
      await createNamespace(newNamespace)
      setNamespaces(prev => [...prev, newNamespace])
      setNewNamespaceName('')
      setCreateDialogOpen(false)
      toast.success('Namespace created')
    } catch (error) {
      console.error('Failed to create namespace:', error)
      toast.error('Failed to create namespace')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNamespace = async () => {
    if (!namespaceToDelete) return

    setLoading(true)
    try {
      await deleteNamespace(namespaceToDelete.id)
      setNamespaces(prev => prev.filter(n => n.id !== namespaceToDelete.id))
      
      if (selectedNamespaceId === namespaceToDelete.id) {
        const defaultNamespace = namespaces.find(n => n.isDefault)
        if (defaultNamespace) {
          onNamespaceChange(defaultNamespace.id)
        }
      }
      
      setDeleteDialogOpen(false)
      setNamespaceToDelete(null)
      toast.success('Namespace deleted, snippets moved to default')
    } catch (error) {
      console.error('Failed to delete namespace:', error)
      toast.error('Failed to delete namespace')
    } finally {
      setLoading(false)
    }
  }

  const selectedNamespace = namespaces.find(n => n.id === selectedNamespaceId)

  return (
    <div className="flex items-center gap-2" data-testid="namespace-selector" role="group" aria-label="Namespace selector">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Folder weight="fill" className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">Namespace:</span>
      </div>

      <Select
        value={selectedNamespaceId || undefined}
        onValueChange={onNamespaceChange}
      >
        <SelectTrigger
          className="w-[200px]"
          data-testid="namespace-selector-trigger"
          aria-label="Select namespace"
        >
          <SelectValue placeholder={selectedNamespace?.name || 'Select namespace'} />
        </SelectTrigger>
        <SelectContent data-testid="namespace-selector-content">
          {namespaces.map(namespace => (
            <SelectItem
              key={namespace.id}
              value={namespace.id}
              data-testid={`namespace-option-${namespace.id}`}
            >
              <div className="flex items-center gap-2">
                <span>{namespace.name}</span>
                {namespace.isDefault && (
                  <span className="text-xs text-muted-foreground">(Default)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CreateNamespaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        namespaceName={newNamespaceName}
        onNamespaceNameChange={setNewNamespaceName}
        onCreateNamespace={handleCreateNamespace}
        loading={loading}
      />

      {selectedNamespace && !selectedNamespace.isDefault && (
        <DeleteNamespaceDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          namespace={namespaceToDelete}
          onDeleteNamespace={handleDeleteNamespace}
          loading={loading}
          showTrigger
          onOpenDialog={() => {
            setNamespaceToDelete(selectedNamespace)
            setDeleteDialogOpen(true)
          }}
        />
      )}
    </div>
  )
}
