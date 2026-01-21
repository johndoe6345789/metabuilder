import { useKV } from '../use-kv'
import { useCallback } from 'react'
import { z } from 'zod'

export function useKVState<T>(
  key: string,
  defaultValue: T,
  schema?: z.ZodType<T>
) {
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)

  const setValidatedValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValue((prev = defaultValue) => {
        const nextValue = typeof newValue === 'function' 
          ? (newValue as (prev: T) => T)(prev)
          : newValue

        if (schema) {
          const result = schema.safeParse(nextValue)
          if (!result.success) {
            console.error('Validation failed:', result.error)
            return prev
          }
          return result.data
        }

        return nextValue
      })
    },
    [setValue, schema, defaultValue]
  )

  return [value, setValidatedValue, deleteValue] as const
}
