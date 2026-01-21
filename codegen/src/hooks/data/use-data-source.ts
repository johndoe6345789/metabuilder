import { useKV } from '@/hooks/use-kv'

export type DataSourceType = 'kv' | 'static'

export interface DataSourceConfig<T = any> {
  type: DataSourceType
  key?: string
  defaultValue?: T
}

export function useKVDataSource<T = any>(key: string, defaultValue?: T) {
  return useKV(key, defaultValue)
}

export function useStaticDataSource<T = any>(defaultValue: T) {
  return [defaultValue, () => {}, () => {}] as const
}

export function useComputedDataSource<T = any>(expression: string | (() => T), dependencies: string[] = []) {
  // Simple implementation - in a real app this would evaluate the expression
  const computedValue = typeof expression === 'function' ? expression() : expression
  return [computedValue, () => {}, () => {}] as const
}

export function useMultipleDataSources(_sources: DataSourceConfig[]) {
  return {}
}
