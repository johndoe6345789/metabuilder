import { useCallback, useMemo } from 'react'
import { Action, PageSchema } from '@/types/json-ui'
import { useDataSources } from '@/hooks/data/use-data-sources'
import { useActionExecutor } from '@/hooks/ui/use-action-executor'
import { JSONUIRenderer } from './renderer'

interface PageRendererProps {
  schema: PageSchema
  onCustomAction?: (action: any, event?: any) => Promise<void>
  data?: Record<string, any>
  functions?: Record<string, any>
}

export function PageRenderer({ schema, onCustomAction, data: externalData, functions }: PageRendererProps) {
  const { data: sourceData, updateData, updatePath } = useDataSources(schema.dataSources)
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

  const handleAction = useCallback((actions: Action[], eventData?: unknown) => {
    if (!actions?.length) return
    executeActions(actions, eventData)
  }, [executeActions])

  return (
    <div className="h-full w-full">
      {schema.components.map((component, index) => (
        <JSONUIRenderer
          key={component.id || index}
          component={component}
          dataMap={{ ...mergedData, ...functions }}
          onAction={handleAction}
        />
      ))}
    </div>
  )
}
