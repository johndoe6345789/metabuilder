import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import type { ComponentDefinition, PropDefinition } from '@/lib/components/types'

interface SelectOption {
  value: string
  label: string
}

interface ComponentConfigFieldsProps {
  componentDef?: ComponentDefinition
  props: Record<string, unknown>
  setProps: (value: Record<string, unknown>) => void
  styles: Record<string, unknown>
  setStyles: (value: Record<string, unknown>) => void
  events: Record<string, string>
  setEvents: (value: Record<string, string>) => void
  nerdMode: boolean
}

function renderPropEditor(
  propSchema: PropDefinition,
  props: Record<string, unknown>,
  setProps: (value: Record<string, unknown>) => void
) {
  const value = props[propSchema.name] ?? propSchema.defaultValue

  switch (propSchema.type) {
    case 'string':
      return (
        <Input
          value={String(value || '')}
          onChange={(e) => setProps({ ...props, [propSchema.name]: e.target.value })}
          placeholder={String(propSchema.defaultValue || '')}
        />
      )

    case 'number':
      return (
        <Input
          type="number"
          value={String(value || '')}
          onChange={(e) => setProps({ ...props, [propSchema.name]: Number(e.target.value) })}
        />
      )

    case 'boolean':
      return (
        <Switch
          checked={Boolean(value)}
          onCheckedChange={(checked) => setProps({ ...props, [propSchema.name]: checked })}
        />
      )

    case 'select':
      return (
        <Select
          value={String(value || propSchema.defaultValue || '')}
          onValueChange={(val) => setProps({ ...props, [propSchema.name]: val })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {propSchema.options?.map((opt: SelectOption) => (
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
          value={String(value || '')}
          onChange={(e) => setProps({ ...props, [propSchema.name]: e.target.value })}
        />
      )
  }
}

export function ComponentConfigFields({
  componentDef,
  props,
  setProps,
  styles,
  setStyles,
  events,
  setEvents,
  nerdMode,
}: ComponentConfigFieldsProps) {
  return (
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
                {renderPropEditor(propSchema, props, setProps)}
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
                    } catch {
                      // Ignore invalid JSON during typing
                    }
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
              value={String(props.className || '')}
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
                    } catch {
                      // Ignore invalid JSON during typing
                    }
                  }}
                  className="font-mono text-xs"
                  rows={12}
                  placeholder={'{\n  "backgroundColor": "#fff",\n  "padding": "16px"\n}'}
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
                    } catch {
                      // Ignore invalid JSON during typing
                    }
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
  )
}
