'use client'

import React from 'react'

import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import type { JSONComponent } from '@/lib/packages/json/types'

type PageActionHandler = (action: string, data: Record<string, unknown>) => void | Promise<void>

interface UIPageRendererProps {
  layout: JSONComponent
  actions?: Record<string, PageActionHandler>
}

/**
 * Generic TSX renderer for database-loaded UI pages
 * Flow: Database → JSON component → React Elements → User
 */
export function UIPageRenderer({ layout, actions = {} }: UIPageRendererProps) {
  const elements = React.useMemo(() => renderJSONComponent(layout), [layout])

  return (
    <UIPageActionsContext.Provider value={actions}>
      {elements}
    </UIPageActionsContext.Provider>
  )
}

/**
 * Context for action handlers
 * Components can access these via useUIPageActions hook
 */
const UIPageActionsContext = React.createContext<Record<string, PageActionHandler>>({})

/**
 * Hook to access page action handlers
 */
export function useUIPageActions() {
  return React.useContext(UIPageActionsContext)
}

/**
 * Hook to get a specific action handler
 */
export function useAction(actionName: string) {
  const actions = useUIPageActions()
  return actions[actionName]
}
