import { Badge } from '@metabuilder/fakemui/data-display'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Database } from '@metabuilder/fakemui/icons'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import { ComponentTree } from '@/store/slices/componentTreesSlice'

type ComponentTreesCardProps = {
  trees: ComponentTree[]
}

export function ComponentTreesCard({ trees }: ComponentTreesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{reduxIntegrationCopy.componentTrees.title}</CardTitle>
        <CardDescription>{reduxIntegrationCopy.componentTrees.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {trees.length === 0 ? (
          <div>
            <Database />
            <p>{reduxIntegrationCopy.componentTrees.empty}</p>
          </div>
        ) : (
          <div>
            {trees.map((tree) => (
              <div key={tree.id}>
                <div>
                  <div>{tree.name}</div>
                  {tree.description && (
                    <div>{tree.description}</div>
                  )}
                </div>
                <Badge variant="outlined">{tree.root.type}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
