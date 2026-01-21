import { useKVState } from '../core/use-kv-state'

export function useFeatureFlags() {
  const [featureFlags, setFeatureFlags] = useKVState<Record<string, boolean>>(
    'feature-flags',
    {}
  )

  const isEnabled = (featureId: string) => {
    return (featureFlags || {})[featureId] ?? true
  }

  const enable = (featureId: string) => {
    setFeatureFlags((prev = {}) => ({ ...prev, [featureId]: true }))
  }

  const disable = (featureId: string) => {
    setFeatureFlags((prev = {}) => ({ ...prev, [featureId]: false }))
  }

  const toggle = (featureId: string) => {
    setFeatureFlags((prev = {}) => ({ ...prev, [featureId]: !prev[featureId] }))
  }

  return {
    featureFlags,
    isEnabled,
    enable,
    disable,
    toggle,
  }
}
