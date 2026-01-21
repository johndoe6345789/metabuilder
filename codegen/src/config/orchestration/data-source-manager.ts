import { useKV } from '@/hooks/use-kv'
import { DataSource } from './schema'
import { useEffect, useState } from 'react'

export function useDataSource(source: DataSource) {
  const [kvData, setKvData] = useKV(source.key || source.id, source.defaultValue)
  const [apiData, setApiData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (source.type === 'api' && source.endpoint) {
      setLoading(true)
      fetch(source.endpoint)
        .then((res) => res.json())
        .then((data) => {
          setApiData(data)
          setError(null)
        })
        .catch((err) => {
          setError(err)
          setApiData(null)
        })
        .finally(() => setLoading(false))
    }
  }, [source.type, source.endpoint])

  switch (source.type) {
    case 'kv':
      return { data: kvData, setData: setKvData, loading: false, error: null }
    case 'api':
      return { data: apiData, setData: setApiData, loading, error }
    case 'static':
      return {
        data: source.defaultValue,
        setData: () => {},
        loading: false,
        error: null,
      }
    default:
      return {
        data: null,
        setData: () => {},
        loading: false,
        error: null,
      }
  }
}

export function useDataSources(sources: DataSource[]) {
  const [dataMap, setDataMapState] = useState<Record<string, any>>({})

  const updateData = (key: string, value: any) => {
    setDataMapState((prev) => ({ ...prev, [key]: value }))
  }

  const getData = (key: string) => {
    return dataMap[key]
  }

  useEffect(() => {
    sources.forEach((source) => {
      if (source.type === 'static') {
        updateData(source.id, source.defaultValue)
      }
    })
  }, [sources])

  return {
    dataMap,
    updateData,
    getData,
  }
}
