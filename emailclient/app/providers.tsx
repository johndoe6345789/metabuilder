'use client'

import { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

// Configure Redux store
const store = configureStore({
  reducer: {
    ...coreReducers
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  )
}
