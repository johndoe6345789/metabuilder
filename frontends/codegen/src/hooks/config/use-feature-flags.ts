import { useUIState } from '@/hooks/use-ui-state'

export function useFeatureFlags() {
  const [featureFlags, setFeatureFlags] = useUIState<Record<string, boolean>>(
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
