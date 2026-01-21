import React from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { NavigationProvider } from '@/components/layout/navigation/NavigationProvider'

// Create a custom render function that wraps components with necessary providers
function render(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <NavigationProvider>
          {children}
        </NavigationProvider>
      </Provider>
    )
  }

  return rtlRender(ui, { wrapper: Wrapper, ...options })
}

export * from '@testing-library/react'
export { render }
