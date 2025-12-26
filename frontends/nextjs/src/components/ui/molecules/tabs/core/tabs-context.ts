import { createContext } from 'react'

export interface TabsContextValue {
  value: string
  setValue: (value: string) => void
  idPrefix: string
}

export const TabsContext = createContext<TabsContextValue | null>(null)
