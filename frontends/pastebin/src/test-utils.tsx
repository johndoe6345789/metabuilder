import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/store'
// eslint-disable-next-line max-len
import { NavigationProvider } from '@/components/layout/navigation/NavigationProvider'

// Shared provider wrapper for render() and renderHook(fn, { wrapper }).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <NavigationProvider>{children}</NavigationProvider>
    </Provider>
  )
}

// Custom render that wraps components with the necessary providers.
function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return rtlRender(ui, { wrapper: Providers, ...options })
}

export * from '@testing-library/react'
export { render }
