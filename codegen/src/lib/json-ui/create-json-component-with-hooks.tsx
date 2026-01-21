import { ComponentRenderer } from './component-renderer'
import { getHook } from './hooks-registry'

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
      }
    }
  }
) {
  return function JsonComponent(props: TProps) {
    // Execute hooks if defined
    const hookResults: Record<string, any> = {}
    
    if (options?.hooks) {
      for (const [resultKey, hookConfig] of Object.entries(options.hooks)) {
        const hook = getHook(hookConfig.hookName)
        if (hook) {
          const args = hookConfig.args ? hookConfig.args(props) : []
          hookResults[resultKey] = hook(...args)
        }
      }
    }

    // Merge hook results with props for data binding
    const dataWithHooks = {
      ...props,
      ...hookResults,
    }

    return (
      <ComponentRenderer
        component={jsonDefinition}
        data={dataWithHooks}
        context={{}}
      />
    )
  }
}
