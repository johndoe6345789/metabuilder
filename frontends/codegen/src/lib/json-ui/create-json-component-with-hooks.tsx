import { useContext } from 'react'
import { JSONUIRenderer } from './renderer'
import { getHook } from './hooks-registry'
import { ActiveJsonDefs } from './create-json-component'

/**
 * Creates a React component from a JSON definition with hook support
 * Allows JSON components to use custom React hooks
 */
export function createJsonComponentWithHooks<TProps = any>(
  jsonDefinition: any,
  options?: {
    hooks?: {
      [key: string]: {
        hookName: string
        args?: (props: TProps) => any[]
        selector?: (result: any) => any
        spread?: boolean
      }
    }
  }
) {
  const defId = jsonDefinition?.id || jsonDefinition?.type || 'unknown'

  return function JsonComponent(props: TProps) {
    const activeDefs = useContext(ActiveJsonDefs)

    if (activeDefs.has(defId)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[JSON-UI] Circular JSON definition detected: "${defId}". Breaking cycle.`
        )
      }
      return null
    }

    const hookResults: Record<string, any> = {}

    if (options?.hooks) {
      for (const [resultKey, hookConfig] of Object.entries(options.hooks)) {
        const hook = getHook(hookConfig.hookName)
        if (hook) {
          const args = hookConfig.args ? hookConfig.args(props) : []
          let result = hook(...args)
          if (hookConfig.selector) {
            result = hookConfig.selector(result)
          }
          if (hookConfig.spread && result && typeof result === 'object') {
            Object.assign(hookResults, result)
          } else {
            hookResults[resultKey] = result
          }
        }
      }
    }

    const dataWithHooks = {
      ...props,
      ...hookResults,
    }

    const nextDefs = new Set(activeDefs)
    nextDefs.add(defId)

    return (
      <ActiveJsonDefs.Provider value={nextDefs}>
        <JSONUIRenderer
          component={jsonDefinition}
          dataMap={dataWithHooks as Record<string, unknown>}
        />
      </ActiveJsonDefs.Provider>
    )
  }
}
