import { useCallback, useEffect, useState } from 'react'
import { DataSource } from '@/types/json-ui'

export function useDataSourceEditor(
  dataSource: DataSource | null,
) {
  const [editingSource, setEditingSource] = useState<DataSource | null>(dataSource)

  useEffect(() => {
    setEditingSource(dataSource)
  }, [dataSource])

  const updateField = useCallback(<K extends keyof DataSource>(field: K, value: DataSource[K]) => {
    setEditingSource(prev => (prev ? { ...prev, [field]: value } : prev))
  }, [])

  return {
    editingSource,
    updateField,
  }
}
