import { useState } from 'react'

export function usePasswordVisibility() {
  const [showPassword, setShowPassword] = useState(false)

  const toggleVisibility = () => setShowPassword(!showPassword)

  return {
    showPassword,
    setShowPassword,
    toggleVisibility,
  }
}
