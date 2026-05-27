import { PageSchema } from '@/types/json-ui'
import { JSONUIRenderer } from './renderer'
import { usePageRenderer } from './hooks/usePageRenderer'

interface PageRendererProps {
  schema: PageSchema
  onCustomAction?: (action: any, event?: any) => Promise<void>
  data?: Record<string, any>
  functions?: Record<string, any>
}

export function PageRenderer(
  { schema, onCustomAction, data, functions }: PageRendererProps,
) {
  const { mergedData, handleAction } = usePageRenderer({
    schema,
    onCustomAction,
    data,
    functions,
  })

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
