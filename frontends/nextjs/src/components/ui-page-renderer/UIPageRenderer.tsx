'use client'

import React from 'react'

import { generateComponentTree } from '@/lib/lua/ui/generate-component-tree'
import type { LuaUIComponent } from '@/lib/lua/ui/types/lua-ui-package'
import type { LuaActionHandler, UIPageData } from '@/lib/ui-pages/load-page-from-db'

interface UIPageRendererProps {
  pageData: UIPageData
}

/**
 * Generic TSX renderer for database-loaded UI pages
 * Flow: Database → Lua → This Component → React Elements → User
 */
export function UIPageRenderer({ pageData }: UIPageRendererProps) {
  // Convert JSON layout to LuaUIComponent structure
  const layout = pageData.layout as unknown as LuaUIComponent

  // Create React elements from component tree
  const elements = generateComponentTree(layout)

  // Provide action handlers via context
  return (
    <UIPageActionsContext.Provider value={pageData.actions}>
      {elements}
    </UIPageActionsContext.Provider>
  )
}

/**
 * Context for action handlers
 * Components can access these via useUIPageActions hook
 */
const UIPageActionsContext = React.createContext<Record<string, LuaActionHandler>>({})

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
