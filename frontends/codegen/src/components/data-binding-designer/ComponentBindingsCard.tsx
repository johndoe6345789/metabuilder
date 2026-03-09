import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { Badge } from '@metabuilder/fakemui/data-display'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DataSource, UIComponent } from '@/types/json-ui'
import { Link, Code } from '@metabuilder/fakemui/icons'

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
        <CardTitle>
          <Code />
          {copy.title}
        </CardTitle>
        <CardDescription>
          {copy.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div>
            {components.map(component => {
              const bindingCount = Object.keys(component.bindings || {}).length

              return (
                <Card key={component.id}>
                  <CardContent>
                    <div>
                      <div>
                        <div>
                          <Badge variant="outlined">
                            {component.type}
                          </Badge>
                          <span>
                            #{component.id}
                          </span>
                        </div>

                        {bindingCount > 0 ? (
                          <div>
                            {Object.entries(component.bindings || {}).map(([prop, binding]) => {
                              const source = getSourceById(binding.source)
                              return (
                                <div key={prop}>
                                  <span>
                                    {prop}:
                                  </span>
                                  <Badge variant="filled">
                                    {binding.source}
                                    {binding.path && `.${binding.path}`}
                                  </Badge>
                                  {source && (
                                    <Badge variant="outlined">
                                      {source.type}
                                    </Badge>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <p>
                            {copy.emptyState}
                          </p>
                        )}
                      </div>

                      <Button
                        size="small"
                        variant="text"
                        onClick={() => onEditBinding(component)}
                      >
                        <Link />
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
