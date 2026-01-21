import React, { useCallback } from 'react'
import { PageSchema, ComponentDef } from './schema'
import { getComponent } from './component-registry'
import { useDataSources } from './data-source-manager'
import { executeAction, ActionContext } from './action-executor'

interface PageRendererProps {
  schema: PageSchema
  onNavigate?: (path: string) => void
  customHandlers?: Record<string, (payload?: any) => void | Promise<void>>
}

export function PageRenderer({ schema, onNavigate, customHandlers = {} }: PageRendererProps) {
  const { dataMap, updateData, getData } = useDataSources(schema.dataSources || [])

  const context: ActionContext = {
    navigate: onNavigate || (() => {}),
    updateData,
    getData,
    customHandlers,
  }

  const handleAction = useCallback(
    (actionId: string, payload?: any) => {
      const action = schema.actions?.find((a) => a.id === actionId)
      if (action) {
        executeAction({ ...action, payload: payload || action.payload }, context)
      }
    },
    [schema.actions, context]
  )

  const renderComponent = (compDef: ComponentDef): React.ReactNode => {
    const Component = getComponent(compDef.type)
    if (!Component) {
      console.warn(`Component ${compDef.type} not found in registry`)
      return null
    }

    const props = { ...compDef.props }

    if (compDef.dataBinding && dataMap[compDef.dataBinding]) {
      props.data = dataMap[compDef.dataBinding]
    }

    if (compDef.eventHandlers) {
      Object.entries(compDef.eventHandlers).forEach(([event, actionId]) => {
        props[event] = (payload?: any) => handleAction(String(actionId), payload)
      })
    }

    const children = compDef.children?.map((child) => renderComponent(child))

    return (
      <Component key={compDef.id} {...props}>
        {children}
      </Component>
    )
  }

  return (
    <div className="h-full w-full">
      {schema.components.map((comp) => renderComponent(comp))}
    </div>
  )
}
