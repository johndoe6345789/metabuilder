import { Code, PaintBrush } from '@phosphor-icons/react'

import { Button, ScrollArea, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import type { DropdownConfig } from '@/lib/database'
import type { ComponentDefinition, ComponentInstance } from '@/lib/types/builder-types'
import type { JsonValue } from '@/types/utility-types'

import { FieldTypes } from './FieldTypes'

interface PropertyPanelsProps {
  component: ComponentInstance
  componentDef?: ComponentDefinition
  dynamicDropdowns: DropdownConfig[]
  onPropChange: (propName: string, value: JsonValue) => void
  onCodeEdit: () => void
  onOpenCssBuilder: (propName: string) => void
}

export function PropertyPanels({
  component,
  componentDef,
  dynamicDropdowns,
  onPropChange,
  onCodeEdit,
  onOpenCssBuilder,
}: PropertyPanelsProps) {
  return (
    <Tabs defaultValue="props" className="flex-1 flex flex-col">
      <TabsList className="w-full rounded-none border-b">
        <TabsTrigger value="props" className="flex-1">
          <PaintBrush className="mr-2" size={16} />
          Props
        </TabsTrigger>
        <TabsTrigger value="code" className="flex-1">
          <Code className="mr-2" size={16} />
          Code
        </TabsTrigger>
      </TabsList>

      <TabsContent value="props" className="flex-1 mt-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {componentDef?.propSchema?.length ? (
              componentDef.propSchema.map(propDef => {
                const dynamicDropdown =
                  propDef.type === 'dynamic-select'
                    ? dynamicDropdowns.find(d => d.name === propDef.dynamicSource)
                    : null

                return (
                  <FieldTypes
                    key={propDef.name}
                    propDef={propDef}
                    value={component.props[propDef.name] || ''}
                    onChange={value => onPropChange(propDef.name, value)}
                    dynamicDropdown={dynamicDropdown}
                    onOpenCssBuilder={() => onOpenCssBuilder(propDef.name)}
                  />
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                This component has no configurable properties.
              </p>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="code" className="flex-1 mt-0">
        <div className="p-4 h-full flex flex-col items-center justify-center text-center space-y-4">
          <Code size={48} className="text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Add custom JavaScript code for this component
            </p>
            <Button onClick={onCodeEdit} variant="outline">
              Open Code Editor
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
