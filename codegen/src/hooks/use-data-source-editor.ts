import { useCallback, useEffect, useState } from 'react'
import { DataSource } from '@/types/json-ui'

interface UseDataSourceEditorParams {
  dataSource: DataSource | null
  onSave: (dataSource: DataSource) => void
  onOpenChange: (open: boolean) => void
}

export function useDataSourceEditor({
  dataSource,
  onSave,
  onOpenChange,
}: UseDataSourceEditorParams) {
  const [editingSource, setEditingSource] = useState<DataSource | null>(dataSource)

  useEffect(() => {
    setEditingSource(dataSource)
  }, [dataSource])

  const updateField = useCallback(<K extends keyof DataSource>(field: K, value: DataSource[K]) => {
    setEditingSource((prev) => {
      if (!prev) return prev
      return { ...prev, [field]: value }
    })
  }, [])

  const handleSave = useCallback(() => {
    if (!editingSource) return
    onSave(editingSource)
    onOpenChange(false)
  }, [editingSource, onOpenChange, onSave])

  return {
    editingSource,
    updateField,
    handleSave,
  }
}
