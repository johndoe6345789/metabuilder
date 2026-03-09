import { useState } from 'react'

export function useFocusState() {
  const [isFocused, setFocused] = useState(false)

  return {
    isFocused,
    setFocused,
  }
}
