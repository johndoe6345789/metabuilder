import { useState } from 'react'

export interface UseToggleOptions {
  initial?: boolean
}

export function useToggle(options: UseToggleOptions = {}) {
  const { initial = false } = options
  const [value, setValue] = useState(initial)

  const toggle = () => setValue(v => !v)
  const setTrue = () => setValue(true)
  const setFalse = () => setValue(false)

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
  }
}
