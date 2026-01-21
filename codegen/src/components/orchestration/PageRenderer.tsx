import { PageSchema } from '@/types/page-schema'
import { usePage } from '@/hooks/orchestration/use-page'
import { ComponentRenderer } from './ComponentRenderer'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PageRendererProps {
  schema: PageSchema
}

export function PageRenderer({ schema }: PageRendererProps) {
  const { context, execute } = usePage(schema)
  
  const handleEvent = (actionId: string, params?: any) => {
    execute(actionId, params)
  }
  
  return (
    <div className="h-full">
      {renderLayout(schema, context, handleEvent)}
    </div>
  )
}

function renderLayout(
  schema: PageSchema,
  context: Record<string, any>,
  handleEvent: (actionId: string, params?: any) => void
) {
  switch (schema.layout.type) {
    case 'single':
      return (
        <div className="h-full">
          {schema.components.map((component, index) => (
            <ComponentRenderer
              key={component.id || index}
              schema={component}
              context={context}
              onEvent={handleEvent}
            />
          ))}
        </div>
      )
    
    case 'split':
      return (
        <ResizablePanelGroup
          direction={schema.layout.direction || 'horizontal'}
          className="h-full"
        >
          {schema.components.map((component, index) => (
            <>
              <ResizablePanel
                key={component.id || index}
                defaultSize={schema.layout.sizes?.[index] || 50}
              >
                <ComponentRenderer
                  schema={component}
                  context={context}
                  onEvent={handleEvent}
                />
              </ResizablePanel>
              {index < schema.components.length - 1 && <ResizableHandle />}
            </>
          ))}
        </ResizablePanelGroup>
      )
    
    case 'tabs':
      return (
        <Tabs defaultValue={schema.components[0]?.id} className="h-full">
          <TabsList>
            {schema.components.map(component => (
              <TabsTrigger key={component.id} value={component.id}>
                {component.props?.label || component.id}
              </TabsTrigger>
            ))}
          </TabsList>
          {schema.components.map(component => (
            <TabsContent key={component.id} value={component.id} className="h-full">
              <ComponentRenderer
                schema={component}
                context={context}
                onEvent={handleEvent}
              />
            </TabsContent>
          ))}
        </Tabs>
      )
    
    case 'grid':
      return (
        <div
          className="grid h-full"
          style={{
            gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(schema.components.length))}, 1fr)`,
            gap: schema.layout.gap || 16,
          }}
        >
          {schema.components.map((component, index) => (
            <ComponentRenderer
              key={component.id || index}
              schema={component}
              context={context}
              onEvent={handleEvent}
            />
          ))}
        </div>
      )
    
    default:
      return null
  }
}
