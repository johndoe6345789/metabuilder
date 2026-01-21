/// <reference path="../../global.d.ts" />

import { useState, useEffect, useMemo, useCallback } from 'react'
import { DataSource } from '@/types/json-ui'
import { evaluateExpression, evaluateTemplate } from '@/lib/json-ui/expression-evaluator'

export function useDataSources(dataSources: DataSource[]) {
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const staticSources = useMemo(
    () => dataSources.filter((ds) => ds.type === 'static'),
    [dataSources]
  )

  const derivedSources = useMemo(
    () => dataSources.filter((ds) => ds.expression || ds.valueTemplate),
    [dataSources]
  )

  useEffect(() => {
    const loadData = async () => {
      const initialData: Record<string, any> = {}

      for (const ds of dataSources) {
        if (ds.type === 'kv' && ds.key) {
          try {
            const value = await window.spark.kv.get(ds.key)
            initialData[ds.id] = value !== undefined ? value : ds.defaultValue
          } catch {
            initialData[ds.id] = ds.defaultValue
          }
        } else if (ds.type === 'static') {
          initialData[ds.id] = ds.defaultValue
        }
      }

      setData(initialData)
      setLoading(false)
    }

    loadData()
  }, [dataSources])

  const updateDataSource = useCallback(async (id: string, value: any) => {
    setData((prev) => ({ ...prev, [id]: value }))

    const kvSource = dataSources.find((ds) => ds.id === id && ds.type === 'kv')
    if (kvSource && kvSource.key) {
      await window.spark.kv.set(kvSource.key, value)
    }
  }, [dataSources])

  const computedData = useMemo(() => {
    const result: Record<string, any> = {}
    
    derivedSources.forEach((ds) => {
      const evaluationContext = { data: { ...data, ...result } }
      if (ds.expression) {
        result[ds.id] = evaluateExpression(ds.expression, evaluationContext)
        return
      }
      if (ds.valueTemplate) {
        result[ds.id] = evaluateTemplate(ds.valueTemplate, evaluationContext)
        return
      }
      if (ds.defaultValue !== undefined) {
        result[ds.id] = ds.defaultValue
      }
    })
    
    return result
  }, [derivedSources, data])

  const allData = useMemo(
    () => ({ ...data, ...computedData }),
    [data, computedData]
  )

  return {
    data: allData,
    loading,
    updateDataSource,
  }
}
