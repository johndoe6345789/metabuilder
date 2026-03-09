import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setUIState } from '@/store/slices/uiStateSlice'
import { DataSource } from '@/types/json-ui'
import { evaluateExpression, evaluateTemplate } from '@/lib/json-ui/expression-evaluator'

export function useDataSources(dataSources: DataSource[]) {
  const dispatch = useAppDispatch()
  const kvData = useAppSelector((state) => state.uiState.data)
  const [data, setData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  const derivedSources = useMemo(
    () => dataSources.filter((ds) => ds.expression || ds.valueTemplate),
    [dataSources]
  )

  useEffect(() => {
    const initialData: Record<string, any> = {}

    for (const ds of dataSources) {
      if (ds.type === 'kv' && ds.key) {
        const stored = kvData[ds.key]
        initialData[ds.id] = stored !== undefined ? stored : ds.defaultValue
      } else if (ds.type === 'static') {
        initialData[ds.id] = ds.defaultValue
      }
    }

    setData(initialData)
    setLoading(false)
  }, [dataSources, kvData])

  const updateDataSource = useCallback((id: string, value: any) => {
    setData((prev) => ({ ...prev, [id]: value }))

    const kvSource = dataSources.find((ds) => ds.id === id && ds.type === 'kv')
    if (kvSource && kvSource.key) {
      dispatch(setUIState({ key: kvSource.key, value }))
    }
  }, [dataSources, dispatch])

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
