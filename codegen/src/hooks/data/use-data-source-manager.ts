import { useState, useCallback } from 'react'
import { DataSource, DataSourceType } from '@/types/json-ui'

export function useDataSourceManager(initialSources: DataSource[] = []) {
  const [dataSources, setDataSources] = useState<DataSource[]>(initialSources)

  const addDataSource = useCallback((type: DataSourceType) => {
    const newSource: DataSource = {
      id: `ds-${Date.now()}`,
      type,
      ...(type === 'kv' && { key: '', defaultValue: null }),
      ...(type === 'static' && { defaultValue: null }),
    }
    
    setDataSources(prev => [...prev, newSource])
    return newSource
  }, [])

  const updateDataSource = useCallback((id: string, updates: Partial<DataSource>) => {
    setDataSources(prev => 
      prev.map(ds => ds.id === id ? { ...ds, ...updates } : ds)
    )
  }, [])

  const deleteDataSource = useCallback((id: string) => {
    setDataSources(prev => prev.filter(ds => ds.id !== id))
  }, [])

  const getDataSource = useCallback((id: string) => {
    return dataSources.find(ds => ds.id === id)
  }, [dataSources])

  const getDependents = useCallback((sourceId: string) => {
    return dataSources.filter(ds => 
      ds.dependencies?.includes(sourceId)
    )
  }, [dataSources])

  return {
    dataSources,
    addDataSource,
    updateDataSource,
    deleteDataSource,
    getDataSource,
    getDependents,
  }
}
