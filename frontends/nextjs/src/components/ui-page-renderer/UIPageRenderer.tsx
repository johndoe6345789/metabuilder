'use client'

import React from 'react'

import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import type { JSONComponent } from '@/lib/packages/json/types'
import { renderNode, type TreeNode } from '@/components/blocks/block-registry'

type PageActionHandler = (action: string, data: Record<string, unknown>) => void | Promise<void>

interface UIPageRendererProps {
  layout: JSONComponent | TreeNode
  actions?: Record<string, PageActionHandler>
}

/** True for a builder component tree ({type,props,children}) vs a rich
 * JSON component ({render:{template}}). */
function isComponentTree(layout: JSONComponent | TreeNode): layout is TreeNode {
  const l = layout as unknown as Record<string, unknown>
  return typeof l === 'object' && l !== null &&
    'type' in l && 'children' in l && !('render' in l)
}

/**
 * Generic renderer for database-loaded UI pages. Component trees (from the
 * god-panel builder) and rich JSON components share one entry point so a page
 * renders identically in the builder preview and in production.
 */
export function UIPageRenderer({ layout, actions = {} }: UIPageRendererProps) {
  const elements = React.useMemo(
    () => (isComponentTree(layout)
      ? renderNode(layout)
      : renderJSONComponent(layout)),
    [layout])

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
