import React from 'react'
import { configureStore } from '@reduxjs/toolkit'
import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  type RenderOptions,
  type RenderHookOptions,
} from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { rootReducers } from '@/store/rootReducer'
// eslint-disable-next-line max-len
import { NavigationProvider } from '@/components/layout/navigation/NavigationProvider'

/**
 * A fresh, plain (non-persisted, no devtools-trace) store for a single test.
 * Hook tests render many times in one process; reusing the persisted singleton
 * accumulates devtools traces, persist timers and subscribers and eventually
 * exhausts the heap. A throwaway store per test also gives real isolation.
 */
export function makeTestStore() {
  return configureStore({
    reducer: rootReducers,
    middleware: gDM => gDM({ serializableCheck: false }),
  })
}

export type TestStore = ReturnType<typeof makeTestStore>

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

/**
 * renderHook wrapped in a fresh Redux store (pass one via opts.store to seed
 * state, e.g. auth). This is the single helper hook tests should use instead
 * of rolling a per-file Provider wrapper.
 */
export function renderHookWithStore<Result, Props>(
  cb: (props: Props) => Result,
  opts: RenderHookOptions<Props> & { store?: TestStore } = {},
) {
  const { store: testStore = makeTestStore(), ...rest } = opts
  return rtlRenderHook(cb, {
    wrapper: ({ children }) =>
      React.createElement(Provider, { store: testStore, children }),
    ...rest,
  })
}

export * from '@testing-library/react'
export { render }
