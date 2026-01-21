import { useState, useCallback } from 'react'
import { useKV } from '@/hooks/use-kv'

export interface UseJSONDataOptions {
  key: string
  defaultValue: any
  persist?: boolean
}

export function useJSONData(options: UseJSONDataOptions) {
  const { key, defaultValue, persist = true } = options

  const [kvValue, setKvValue] = useKV(key, defaultValue)
  const [localValue, setLocalValue] = useState(defaultValue)

  const value = persist ? kvValue : localValue
  const setValue = persist ? setKvValue : setLocalValue

  const update = useCallback((updater: ((prev: any) => any) | any) => {
    if (typeof updater === 'function') {
      setValue(updater)
    } else {
      setValue(updater)
    }
  }, [setValue])

  const updatePath = useCallback((path: string, newValue: any) => {
    setValue((current: any) => {
      const keys = path.split('.')
      const result = { ...current }
      let target: any = result

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        target[key] = { ...target[key] }
        target = target[key]
      }

      target[keys[keys.length - 1]] = newValue
      return result
    })
  }, [setValue])

  const reset = useCallback(() => {
    setValue(defaultValue)
  }, [setValue, defaultValue])

  return {
    value,
    setValue: update,
    updatePath,
    reset,
  }
}
