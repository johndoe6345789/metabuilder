import { useState, useCallback, useEffect } from 'react'
import { useKV } from '@/hooks/use-kv'
import { DataSource } from '@/types/json-ui'
import { setNestedValue } from '@/lib/json-ui/utils'
import { evaluateExpression, evaluateTemplate } from '@/lib/json-ui/expression-evaluator'

export function useDataSources(dataSources: DataSource[]) {
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const kvSources = dataSources.filter(ds => ds.type === 'kv')
  
  const kvState0 = useKV(kvSources[0]?.key || 'ds-0', kvSources[0]?.defaultValue)
  const kvState1 = useKV(kvSources[1]?.key || 'ds-1', kvSources[1]?.defaultValue)
  const kvState2 = useKV(kvSources[2]?.key || 'ds-2', kvSources[2]?.defaultValue)
  const kvState3 = useKV(kvSources[3]?.key || 'ds-3', kvSources[3]?.defaultValue)
  const kvState4 = useKV(kvSources[4]?.key || 'ds-4', kvSources[4]?.defaultValue)
  
  const kvStates = [kvState0, kvState1, kvState2, kvState3, kvState4]

  useEffect(() => {
    const initializeData = async () => {
      const newData: Record<string, any> = {}

      dataSources.forEach((source, index) => {
        if (source.type === 'kv') {
          const kvIndex = kvSources.indexOf(source)
          if (kvIndex !== -1 && kvStates[kvIndex]) {
            newData[source.id] = kvStates[kvIndex][0]
          }
        } else if (source.type === 'static') {
          newData[source.id] = source.defaultValue
        }
      })

      setData(newData)
      setLoading(false)
    }

    initializeData()
  }, [])

  useEffect(() => {
    const derivedSources = dataSources.filter(ds => ds.expression || ds.valueTemplate)

    derivedSources.forEach(source => {
      const deps = source.dependencies || []
      const hasAllDeps = deps.every(dep => dep in data)

      if (hasAllDeps) {
        const evaluationContext = { data }
        const derivedValue = source.expression
          ? evaluateExpression(source.expression, evaluationContext)
          : source.valueTemplate
            ? evaluateTemplate(source.valueTemplate, evaluationContext)
            : source.defaultValue
        setData(prev => ({ ...prev, [source.id]: derivedValue }))
      }
    })
  }, [data, dataSources])

  const updateData = useCallback((sourceId: string, value: any) => {
    const source = dataSources.find(ds => ds.id === sourceId)
    
    if (!source) {
      console.warn(`Data source ${sourceId} not found`)
      return
    }

    if (source.type === 'kv') {
      const kvIndex = kvSources.indexOf(source)
      if (kvIndex !== -1 && kvStates[kvIndex]) {
        kvStates[kvIndex][1](value)
      }
    }

    setData(prev => ({ ...prev, [sourceId]: value }))
  }, [dataSources, kvSources, kvStates])

  const updatePath = useCallback((sourceId: string, path: string, value: any) => {
    const source = dataSources.find(ds => ds.id === sourceId)
    
    if (!source) {
      console.warn(`Data source ${sourceId} not found`)
      return
    }

    setData(prev => {
      const sourceData = prev[sourceId]
      if (!sourceData || typeof sourceData !== 'object') {
        return prev
      }

      const newData = Array.isArray(sourceData) ? [...sourceData] : { ...sourceData }
      setNestedValue(newData, path, value)

      if (source.type === 'kv') {
        const kvIndex = kvSources.indexOf(source)
        if (kvIndex !== -1 && kvStates[kvIndex]) {
          kvStates[kvIndex][1](newData)
        }
      }

      return { ...prev, [sourceId]: newData }
    })
  }, [dataSources, kvSources, kvStates])

  return {
    data,
    updateData,
    updatePath,
    loading,
  }
}
