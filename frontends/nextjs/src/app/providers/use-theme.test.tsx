import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTheme } from './use-theme'
import { ThemeContext } from './theme-context'

describe('useTheme', () => {
  it('throws when used outside a Providers tree', () => {
    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme must be used within Providers'
    )
  })

  it('returns the provided context value', () => {
    const value = {
      mode: 'dark' as const,
      resolvedMode: 'dark' as const,
      setMode: () => undefined,
      toggleTheme: () => undefined,
    }
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
      ),
    })
    expect(result.current).toBe(value)
  })
})
