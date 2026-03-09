import { PropConfig } from '@/types/prop-config'

export function resolveProps(
  propConfig: PropConfig | undefined,
  stateContext: Record<string, any>,
  actionContext: Record<string, any>
): Record<string, any> {
  if (!propConfig) {
    return {}
  }

  const resolvedProps: Record<string, any> = {}

  try {
    if (propConfig.state) {
      for (const stateKey of propConfig.state) {
        try {
          const [propName, contextKey] = stateKey.includes(':')
            ? stateKey.split(':')
            : [stateKey, stateKey]

          if (stateContext[contextKey] !== undefined) {
            resolvedProps[propName] = stateContext[contextKey]
          }
        } catch (err) {
          // skip unresolvable state prop
        }
      }
    }

    if (propConfig.actions) {
      for (const actionKey of propConfig.actions) {
        try {
          const [propName, contextKey] = actionKey.split(':')

          if (actionContext[contextKey]) {
            resolvedProps[propName] = actionContext[contextKey]
          }
        } catch (err) {
          // skip unresolvable action prop
        }
      }
    }
  } catch (err) {
    console.error('[CONFIG] Failed to resolve props:', err)
  }

  return resolvedProps
}
