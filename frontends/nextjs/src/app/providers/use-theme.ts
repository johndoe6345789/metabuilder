import { useContext } from 'react'

import { ThemeContext } from './theme-context'

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === null || context === undefined) {
    throw new Error('useTheme must be used within Providers')
  }
  return context
}
