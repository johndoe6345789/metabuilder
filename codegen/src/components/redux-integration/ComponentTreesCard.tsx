import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database } from '@phosphor-icons/react'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import { ComponentTree } from '@/store/slices/componentTreesSlice'

type ComponentTreesCardProps = {
  trees: ComponentTree[]
}

export function ComponentTreesCard({ trees }: ComponentTreesCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{reduxIntegrationCopy.componentTrees.title}</CardTitle>
        <CardDescription>{reduxIntegrationCopy.componentTrees.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {trees.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{reduxIntegrationCopy.componentTrees.empty}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {trees.map((tree) => (
              <div
                key={tree.id}
                className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{tree.name}</div>
                  {tree.description && (
                    <div className="text-xs text-muted-foreground">{tree.description}</div>
                  )}
                </div>
                <Badge variant="outline">{tree.root.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
