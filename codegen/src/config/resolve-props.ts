import { PropConfig } from '@/types/prop-config'

export function resolveProps(
  propConfig: PropConfig | undefined,
  stateContext: Record<string, any>,
  actionContext: Record<string, any>
): Record<string, any> {
  console.log('[CONFIG] 🔧 resolveProps called')
  if (!propConfig) {
    console.log('[CONFIG] ⏭️ No prop config provided')
    return {}
  }

  const resolvedProps: Record<string, any> = {}

  try {
    if (propConfig.state) {
      console.log('[CONFIG] 📦 Resolving', propConfig.state.length, 'state props')
      for (const stateKey of propConfig.state) {
        try {
          const [propName, contextKey] = stateKey.includes(':')
            ? stateKey.split(':')
            : [stateKey, stateKey]

          if (stateContext[contextKey] !== undefined) {
            resolvedProps[propName] = stateContext[contextKey]
            console.log('[CONFIG] ✅ Resolved state prop:', propName)
          } else {
            console.log('[CONFIG] ⚠️ State prop not found:', contextKey)
          }
        } catch (err) {
          console.warn('[CONFIG] ❌ Failed to resolve state prop:', stateKey, err)
        }
      }
    }

    if (propConfig.actions) {
      console.log('[CONFIG] 🎬 Resolving', propConfig.actions.length, 'action props')
      for (const actionKey of propConfig.actions) {
        try {
          const [propName, contextKey] = actionKey.split(':')

          if (actionContext[contextKey]) {
            resolvedProps[propName] = actionContext[contextKey]
            console.log('[CONFIG] ✅ Resolved action prop:', propName)
          } else {
            console.log('[CONFIG] ⚠️ Action prop not found:', contextKey)
          }
        } catch (err) {
          console.warn('[CONFIG] ❌ Failed to resolve action prop:', actionKey, err)
        }
      }
    }
  } catch (err) {
    console.error('[CONFIG] ❌ Failed to resolve props:', err)
  }

  console.log('[CONFIG] ✅ Props resolved:', Object.keys(resolvedProps).length, 'props')
  return resolvedProps
}
