import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataSource, UIComponent } from '@/types/json-ui'
import { Link, Code } from '@phosphor-icons/react'

interface ComponentBindingsCardCopy {
  title: string
  description: string
  emptyState: string
  actionLabel: string
}

interface ComponentBindingsCardProps {
  components: UIComponent[]
  dataSources: DataSource[]
  copy: ComponentBindingsCardCopy
  onEditBinding: (component: UIComponent) => void
}

export function ComponentBindingsCard({
  components,
  dataSources,
  copy,
  onEditBinding,
}: ComponentBindingsCardProps) {
  const getSourceById = (sourceId: string) => dataSources.find(ds => ds.id === sourceId)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          {copy.title}
        </CardTitle>
        <CardDescription>
          {copy.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-3">
            {components.map(component => {
              const bindingCount = Object.keys(component.bindings || {}).length

              return (
                <Card key={component.id} className="bg-card/50 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            {component.type}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            #{component.id}
                          </span>
                        </div>

                        {bindingCount > 0 ? (
                          <div className="space-y-1">
                            {Object.entries(component.bindings || {}).map(([prop, binding]) => {
                              const source = getSourceById(binding.source)
                              return (
                                <div key={prop} className="flex items-center gap-2 text-xs">
                                  <span className="text-muted-foreground font-mono">
                                    {prop}:
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="font-mono h-5 text-xs"
                                  >
                                    {binding.source}
                                    {binding.path && `.${binding.path}`}
                                  </Badge>
                                  {source && (
                                    <Badge
                                      variant="outline"
                                      className="h-5 text-xs"
                                    >
                                      {source.type}
                                    </Badge>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {copy.emptyState}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditBinding(component)}
                        className="h-8 px-3"
                      >
                        <Link className="w-4 h-4 mr-1" />
                        {copy.actionLabel}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
