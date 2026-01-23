import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { coreReducers } from '@metabuilder/redux-core'

import '@metabuilder/fakemui/dist/styles.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Email Client',
  description: 'Full-featured email client with IMAP/SMTP support',
  viewport: 'width=device-width, initial-scale=1.0'
}

// Configure Redux store
const store = configureStore({
  reducer: {
    ...coreReducers
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      </head>
      <body>
        <Provider store={store}>
          <div id="app-root">{children}</div>
        </Provider>
      </body>
    </html>
  )
}
