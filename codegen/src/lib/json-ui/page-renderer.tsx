import { useCallback, useMemo } from 'react'
import { Action, PageSchema } from '@/types/json-ui'
import { useDataSources } from '@/hooks/data/use-data-sources'
import { useActionExecutor } from '@/hooks/ui/use-action-executor'
import { useAppSelector } from '@/store'
import { ComponentRenderer } from './component-renderer'

interface PageRendererProps {
  schema: PageSchema
  onCustomAction?: (action: any, event?: any) => Promise<void>
  data?: Record<string, any>
  functions?: Record<string, any>
}

export function PageRenderer({ schema, onCustomAction, data: externalData, functions }: PageRendererProps) {
  const { data: sourceData, updateData, updatePath } = useDataSources(schema.dataSources)
  const state = useAppSelector((rootState) => rootState)
  const mergedData = useMemo(() => ({ ...sourceData, ...externalData }), [externalData, sourceData])
  const executeCustomAction = useCallback(async (action: Action, event?: any) => {
    if (onCustomAction) {
      await onCustomAction(action, event)
      return
    }

    const handler = functions?.[action.id]
    if (typeof handler === 'function') {
      await handler(action, event)
    }
  }, [functions, onCustomAction])
  
  const actionContext = {
    data: mergedData,
    updateData,
    updatePath,
    executeAction: executeCustomAction,
  }
  
  const { executeActions } = useActionExecutor(actionContext)
  
  const handleEvent = useCallback((_componentId: string, handler: { actions: any[] }, eventData: any) => {
    if (!handler?.actions?.length) return
    executeActions(handler.actions, eventData)
  }, [executeActions])
  
  return (
    <div className="h-full w-full">
      {schema.components.map((component, index) => (
        <ComponentRenderer
          key={component.id || index}
          component={component}
          data={mergedData}
          context={functions}
          state={state}
          onEvent={handleEvent}
        />
      ))}
    </div>
  )
}
