import { useState, useEffect, useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'
import type { DataSourceConfig } from './schema'

export function useJSONDataSource<T = unknown>(
  id: string,
  config: DataSourceConfig<T>
) {
  const kvConfig = config.type === 'kv' ? config.config : undefined
  const apiConfig = config.type === 'api' ? config.config : undefined
  const defaultValue =
    config.type === 'static' ? config.config : config.config?.defaultValue

  const [kvValue, setKVValue] = useKV<T>(
    kvConfig?.key || id,
    (kvConfig?.defaultValue ?? defaultValue) as T
  )
  const [apiValue, setApiValue] = useState<T | undefined>(defaultValue)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchAPI = useCallback(async () => {
    if (config.type !== 'api' || !apiConfig?.url) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(apiConfig.url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      let data = await response.json()
      
      if (apiConfig.transform) {
        data = apiConfig.transform(data)
      }
      
      setApiValue(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [apiConfig, config.type])

  useEffect(() => {
    if (config.type === 'api') {
      fetchAPI()
    }
  }, [config.type, fetchAPI])

  const getValue = () => {
    switch (config.type) {
      case 'kv':
        return kvValue
      case 'api':
        return apiValue
      case 'static':
        return config.config
      default:
        return null
    }
  }

  const setValue = (newValue: any) => {
    switch (config.type) {
      case 'kv':
        setKVValue(newValue)
        break
      case 'api':
        setApiValue(newValue)
        break
      default:
        break
    }
  }

  return {
    value: getValue(),
    setValue,
    loading,
    error,
    refetch: fetchAPI,
  }
}

export function useJSONDataSources<T = unknown>(
  sources: Record<string, DataSourceConfig<T>>
) {
  const [dataMap, setDataMap] = useState<Record<string, any>>({})
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({})
  const [errorMap, setErrorMap] = useState<Record<string, Error | null>>({})

  const sourceIds = Object.keys(sources)

  const updateData = useCallback((id: string, value: any) => {
    setDataMap((prev) => ({ ...prev, [id]: value }))
  }, [])

  const getData = useCallback((id: string) => {
    return dataMap[id]
  }, [dataMap])

  useEffect(() => {
    sourceIds.forEach((id) => {
      const config = sources[id]
      
      if (config.type === 'static') {
        updateData(id, config.config)
      }
    })
  }, [sourceIds])

  return {
    dataMap,
    loadingMap,
    errorMap,
    updateData,
    getData,
  }
}

export function useJSONActions() {
  const [actionHandlers, setActionHandlers] = useState<Record<string, (...args: any[]) => void>>({})

  const registerAction = useCallback((id: string, handler: (...args: any[]) => void) => {
    setActionHandlers((prev) => ({ ...prev, [id]: handler }))
  }, [])

  const executeAction = useCallback((id: string, ...args: any[]) => {
    const handler = actionHandlers[id]
    if (handler) {
      handler(...args)
    } else {
      console.warn(`Action handler not found: ${id}`)
    }
  }, [actionHandlers])

  return {
    registerAction,
    executeAction,
  }
}

