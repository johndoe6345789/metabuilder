/**
 * usePasswordVisibility Hook
 * Password visibility toggle
 */

import { useState } from 'react'

export interface UsePasswordVisibilityReturn {
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  toggleVisibility: () => void
}

/**
 * Manages password field visibility toggle
 */
export function usePasswordVisibility(): UsePasswordVisibilityReturn {
  const [showPassword, setShowPassword] = useState(false)

  const toggleVisibility = () => setShowPassword(!showPassword)

  return {
    showPassword,
    setShowPassword,
    toggleVisibility,
  }
}
