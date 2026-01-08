import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Database, ComponentNode, ComponentConfig } from '@/lib/database'
import { componentCatalog } from '@/lib/component-catalog'
import { toast } from 'sonner'

interface ComponentConfigDialogProps {
  node: ComponentNode
  isOpen: boolean
  onClose: () => void
  onSave: () => void
  nerdMode?: boolean
}

export function ComponentConfigDialog({ node, isOpen, onClose, onSave, nerdMode = false }: ComponentConfigDialogProps) {
  const [config, setConfig] = useState<ComponentConfig | null>(null)
  const [props, setProps] = useState<Record<string, any>>({})
  const [styles, setStyles] = useState<Record<string, any>>({})
  const [events, setEvents] = useState<Record<string, string>>({})

  useEffect(() => {
    loadConfig()
  }, [node.id])

  const loadConfig = async () => {
    const allConfigs = await Database.getComponentConfigs()
    const existingConfig = allConfigs[node.id]

    if (existingConfig) {
      setConfig(existingConfig)
      setProps(existingConfig.props || {})
      setStyles(existingConfig.styles || {})
      setEvents(existingConfig.events || {})
    } else {
      const componentDef = componentCatalog.find(c => c.type === node.type)
      setProps(componentDef?.defaultProps || {})
      setStyles({})
      setEvents({})
      setConfig(null)
    }
  }

  const handleSave = async () => {
    const newConfig: ComponentConfig = {
      id: config?.id || `config_${Date.now()}`,
      componentId: node.id,
      props,
      styles,
      events,
    }

    const allConfigs = await Database.getComponentConfigs()
    allConfigs[node.id] = newConfig
    await Database.setComponentConfigs(allConfigs)
    
    toast.success('Configuration saved')
    onSave()
  }

  const componentDef = componentCatalog.find(c => c.type === node.type)

  const renderPropEditor = (propSchema: any) => {
    const value = props[propSchema.name] ?? propSchema.defaultValue

    switch (propSchema.type) {
      case 'string':
        return (
          <Input
            value={value || ''}
            onChange={(e) => setProps({ ...props, [propSchema.name]: e.target.value })}
            placeholder={propSchema.defaultValue}
          />
        )
      
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => setProps({ ...props, [propSchema.name]: Number(e.target.value) })}
          />
        )
      
      case 'boolean':
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => setProps({ ...props, [propSchema.name]: checked })}
          />
        )
      
      case 'select':
        return (
          <Select
            value={value || propSchema.defaultValue}
            onValueChange={(val) => setProps({ ...props, [propSchema.name]: val })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {propSchema.options?.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setProps({ ...props, [propSchema.name]: e.target.value })}
          />
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configure {node.type}</DialogTitle>
          <DialogDescription>
            Set properties, styles, and event handlers for this component
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="props" className="flex-1">
          <TabsList className={nerdMode ? "grid w-full grid-cols-3" : "grid w-full grid-cols-2"}>
            <TabsTrigger value="props">Properties</TabsTrigger>
            <TabsTrigger value="styles">Styles</TabsTrigger>
            {nerdMode && <TabsTrigger value="events">Events</TabsTrigger>}
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="props" className="space-y-4 px-1">
              {componentDef?.propSchema && componentDef.propSchema.length > 0 ? (
                componentDef.propSchema.map((propSchema) => (
                  <div key={propSchema.name} className="space-y-2">
                    <Label htmlFor={propSchema.name}>{propSchema.label}</Label>
                    {renderPropEditor(propSchema)}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No configurable properties for this component</p>
                </div>
              )}

              {nerdMode && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Custom Properties (JSON)</CardTitle>
                    <CardDescription className="text-xs">
                      Add additional props as JSON
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={JSON.stringify(props, null, 2)}
                      onChange={(e) => {
                        try {
                          setProps(JSON.parse(e.target.value))
                        } catch {}
                      }}
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="styles" className="space-y-4 px-1">
              <div className="space-y-2">
                <Label htmlFor="className">Tailwind Classes</Label>
                <Input
                  id="className"
                  value={props.className || ''}
                  onChange={(e) => setProps({ ...props, className: e.target.value })}
                  placeholder="p-4 bg-white rounded-lg"
                />
              </div>

              {nerdMode && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Custom Styles (CSS-in-JS)</CardTitle>
                    <CardDescription className="text-xs">
                      Define inline styles as JSON object
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={JSON.stringify(styles, null, 2)}
                      onChange={(e) => {
                        try {
                          setStyles(JSON.parse(e.target.value))
                        } catch {}
                      }}
                      className="font-mono text-xs"
                      rows={12}
                      placeholder='{\n  "backgroundColor": "#fff",\n  "padding": "16px"\n}'
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {nerdMode && (
              <TabsContent value="events" className="space-y-4 px-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Event Handlers</CardTitle>
                    <CardDescription className="text-xs">
                      Map events to Lua script IDs
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {['onClick', 'onChange', 'onSubmit', 'onFocus', 'onBlur'].map((eventName) => (
                      <div key={eventName} className="space-y-2">
                        <Label htmlFor={eventName}>{eventName}</Label>
                        <Input
                          id={eventName}
                          value={events[eventName] || ''}
                          onChange={(e) => setEvents({ ...events, [eventName]: e.target.value })}
                          placeholder="lua_script_id"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Custom Events (JSON)</CardTitle>
                    <CardDescription className="text-xs">
                      Define additional event handlers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={JSON.stringify(events, null, 2)}
                      onChange={(e) => {
                        try {
                          setEvents(JSON.parse(e.target.value))
                        } catch {}
                      }}
                      className="font-mono text-xs"
                      rows={6}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
