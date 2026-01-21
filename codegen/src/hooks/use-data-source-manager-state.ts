import { useState, useCallback } from 'react'
import { DataSource, DataSourceType } from '@/types/json-ui'
import { toast } from 'sonner'
import dataSourceManagerCopy from '@/data/data-source-manager.json'

interface UseDataSourceManagerStateReturn {
  localSources: DataSource[]
  editingSource: DataSource | null
  dialogOpen: boolean
  groupedSources: {
    kv: DataSource[]
    static: DataSource[]
  }
  addDataSource: (type: DataSourceType) => void
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  deleteDataSource: (id: string) => void
  getDependents: (sourceId: string) => DataSource[]
  setEditingSource: (source: DataSource | null) => void
  setDialogOpen: (open: boolean) => void
}

export function useDataSourceManagerState(
  dataSources: DataSource[],
  onChange: (dataSources: DataSource[]) => void
): UseDataSourceManagerStateReturn {
  const [localSources, setLocalSources] = useState<DataSource[]>(dataSources)
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const getDependents = useCallback((sourceId: string) => {
    return localSources.filter(ds =>
      ds.dependencies?.includes(sourceId)
    )
  }, [localSources])

  const addDataSource = useCallback((type: DataSourceType) => {
    const newSource: DataSource = {
      id: `ds-${Date.now()}`,
      type,
      ...(type === 'kv' && { key: '', defaultValue: null }),
      ...(type === 'static' && { defaultValue: null }),
    }
    setLocalSources(prev => [...prev, newSource])
    setEditingSource(newSource)
    setDialogOpen(true)
  }, [])

  const updateDataSource = useCallback((id: string, updates: Partial<DataSource>) => {
    const updated = localSources.map(ds =>
      ds.id === id ? { ...ds, ...updates } : ds
    )
    setLocalSources(updated)
    onChange(updated)
    toast.success(dataSourceManagerCopy.toasts.updated)
  }, [localSources, onChange])

  const deleteDataSource = useCallback((id: string) => {
    const dependents = localSources.filter(ds =>
      ds.dependencies?.includes(id)
    )

    if (dependents.length > 0) {
      const noun = dependents.length === 1 ? 'source' : 'sources'
      toast.error(dataSourceManagerCopy.toasts.deleteBlockedTitle, {
        description: dataSourceManagerCopy.toasts.deleteBlockedDescription
          .replace('{count}', String(dependents.length))
          .replace('{noun}', noun),
      })
      return
    }

    const updated = localSources.filter(ds => ds.id !== id)
    setLocalSources(updated)
    onChange(updated)
    toast.success(dataSourceManagerCopy.toasts.deleted)
  }, [localSources, onChange])

  const groupedSources = {
    kv: localSources.filter(ds => ds.type === 'kv'),
    static: localSources.filter(ds => ds.type === 'static'),
  }

  return {
    localSources,
    editingSource,
    dialogOpen,
    groupedSources,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    getDependents,
    setEditingSource,
    setDialogOpen,
  }
}
