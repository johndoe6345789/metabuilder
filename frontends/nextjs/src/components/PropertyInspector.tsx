import { useState, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ComponentInstance } from '@/lib/builder-types'
import { componentCatalog } from '@/lib/component-catalog'
import { Code, PaintBrush, Trash, Palette } from '@phosphor-icons/react'
import { CssClassBuilder } from '@/components/CssClassBuilder'
import { Database, DropdownConfig } from '@/lib/database'

interface PropertyInspectorProps {
  component: ComponentInstance | null
  onUpdate: (id: string, props: any) => void
  onDelete: (id: string) => void
  onCodeEdit: () => void
}

export function PropertyInspector({ component, onUpdate, onDelete, onCodeEdit }: PropertyInspectorProps) {
  const [cssBuilderOpen, setCssBuilderOpen] = useState(false)
  const [cssBuilderPropName, setCssBuilderPropName] = useState('')
  const [dynamicDropdowns, setDynamicDropdowns] = useState<DropdownConfig[]>([])

  useEffect(() => {
    loadDynamicDropdowns()
  }, [])

  const loadDynamicDropdowns = async () => {
    const dropdowns = await Database.getDropdownConfigs()
    setDynamicDropdowns(dropdowns)
  }

  if (!component) {
    return (
      <div className="w-80 bg-card border-l border-border p-6 flex items-center justify-center text-center">
        <p className="text-muted-foreground">Select a component to edit its properties</p>
      </div>
    )
  }

  const componentDef = componentCatalog.find(c => c.type === component.type)

  const handlePropChange = (propName: string, value: any) => {
    onUpdate(component.id, {
      ...component.props,
      [propName]: value,
    })
  }

  const openCssBuilder = (propName: string) => {
    setCssBuilderPropName(propName)
    setCssBuilderOpen(true)
  }

  const handleCssClassSave = (classes: string) => {
    handlePropChange(cssBuilderPropName, classes)
    setCssBuilderOpen(false)
  }

  return (
    <div className="w-80 bg-card border-l border-border flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-bold mb-1">{component.type}</h2>
        <p className="text-xs text-muted-foreground">Component Properties</p>
      </div>

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
              {componentDef?.propSchema.map(propDef => {
                const dynamicDropdown = propDef.type === 'dynamic-select' 
                  ? dynamicDropdowns.find(d => d.name === propDef.dynamicSource)
                  : null

                return (
                  <div key={propDef.name} className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider">{propDef.label}</Label>
                    
                    {propDef.name === 'className' ? (
                      <div className="flex gap-2">
                        <Input
                          value={component.props[propDef.name] || ''}
                          onChange={(e) => handlePropChange(propDef.name, e.target.value)}
                          className="flex-1 font-mono text-xs"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCssBuilder(propDef.name)}
                        >
                          <Palette size={16} />
                        </Button>
                      </div>
                    ) : propDef.type === 'string' ? (
                      <Input
                        value={component.props[propDef.name] || ''}
                        onChange={(e) => handlePropChange(propDef.name, e.target.value)}
                      />
                    ) : propDef.type === 'number' ? (
                      <Input
                        type="number"
                        value={component.props[propDef.name] || ''}
                        onChange={(e) => handlePropChange(propDef.name, Number(e.target.value))}
                      />
                    ) : propDef.type === 'boolean' ? (
                      <Select
                        value={String(component.props[propDef.name] || false)}
                        onValueChange={(value) => handlePropChange(propDef.name, value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : propDef.type === 'select' && propDef.options ? (
                      <Select
                        value={component.props[propDef.name] || propDef.defaultValue}
                        onValueChange={(value) => handlePropChange(propDef.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {propDef.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : propDef.type === 'dynamic-select' && dynamicDropdown ? (
                      <Select
                        value={component.props[propDef.name] || ''}
                        onValueChange={(value) => handlePropChange(propDef.name, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${dynamicDropdown.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {dynamicDropdown.options.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}

                    {propDef.description && (
                      <p className="text-xs text-muted-foreground">{propDef.description}</p>
                    )}
                  </div>
                )
              })}

              {(!componentDef?.propSchema || componentDef.propSchema.length === 0) && (
                <p className="text-sm text-muted-foreground">This component has no configurable properties.</p>
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

      <Separator />

      <div className="p-4">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => onDelete(component.id)}
        >
          <Trash className="mr-2" />
          Delete Component
        </Button>
      </div>

      <CssClassBuilder
        open={cssBuilderOpen}
        onClose={() => setCssBuilderOpen(false)}
        initialValue={component.props[cssBuilderPropName] || ''}
        onSave={handleCssClassSave}
      />
    </div>
  )
}
