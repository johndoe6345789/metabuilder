/**
 * useFocusState Hook
 * Simple focused state management
 */

import { useState } from 'react'

export interface UseFocusStateReturn {
  isFocused: boolean
  setFocused: (focused: boolean) => void
}

/**
 * Tracks focus state
 */
export function useFocusState(): UseFocusStateReturn {
  const [isFocused, setFocused] = useState(false)

  return {
    isFocused,
    setFocused,
  }
}
