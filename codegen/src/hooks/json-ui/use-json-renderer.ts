import { useMemo } from 'react'
import { evaluateBindingExpression } from '@/lib/json-ui/expression-helpers'

export function useJSONRenderer() {
  const resolveBinding = useMemo(() => {
    return (binding: string, data: Record<string, any>): any => {
      if (!binding) return undefined
      
      return evaluateBindingExpression(binding, data, {
        fallback: binding,
        label: 'json renderer binding',
      })
    }
  }, [])

  const resolveValue = useMemo(() => {
    return (value: any, data: Record<string, any>): any => {
      if (typeof value === 'string' && value.startsWith('{{') && value.endsWith('}}')) {
        const binding = value.slice(2, -2).trim()
        return resolveBinding(binding, data)
      }
      return value
    }
  }, [resolveBinding])

  const resolveProps = useMemo(() => {
    return (props: Record<string, any>, data: Record<string, any>): Record<string, any> => {
      const resolved: Record<string, any> = {}
      
      for (const [key, value] of Object.entries(props)) {
        resolved[key] = resolveValue(value, data)
      }
      
      return resolved
    }
  }, [resolveValue])

  return {
    resolveBinding,
    resolveValue,
    resolveProps,
  }
}
