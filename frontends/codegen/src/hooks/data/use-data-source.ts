import { useUIState } from '@/hooks/use-ui-state'

export type DataSourceType = 'kv' | 'static'

export interface DataSourceConfig<T = any> {
  type: DataSourceType
  key?: string
  defaultValue?: T
}

export function useKVDataSource<T = any>(key: string, defaultValue?: T): [T | undefined, (value: T | ((prev: T | undefined) => T | undefined)) => void, () => void] {
  return useUIState(key, defaultValue)
}

export function useStaticDataSource<T = any>(defaultValue: T) {
  return [defaultValue, () => {}, () => {}] as const
}

export function useComputedDataSource<T = any>(expression: string | (() => T), dependencies: string[] = []) {
  const computedValue = typeof expression === 'function' ? expression() : expression
  return [computedValue, () => {}, () => {}] as const
}

export function useMultipleDataSources(_sources: DataSourceConfig[]) {
  return {}
}
