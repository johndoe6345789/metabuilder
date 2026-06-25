import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/m3/surfaces'
import { Button } from '@metabuilder/m3/inputs'
import { Badge, Separator } from '@metabuilder/m3/data-display'
import { Database, FilePlus } from '@metabuilder/m3/icons'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'

type IndexedDbStatusCardProps = {
  filesCount: number
  treesCount: number
  onCreateTestFile: () => void
}

export function IndexedDbStatusCard({
  filesCount,
  treesCount,
  onCreateTestFile,
}: IndexedDbStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Database />
          {reduxIntegrationCopy.cards.indexedDb.title}
        </CardTitle>
        <CardDescription>{reduxIntegrationCopy.cards.indexedDb.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <span>
            {reduxIntegrationCopy.cards.indexedDb.labels.files}
          </span>
          <Badge variant="outlined">{filesCount}</Badge>
        </div>
        <div>
          <span>
            {reduxIntegrationCopy.cards.indexedDb.labels.componentTrees}
          </span>
          <Badge variant="outlined">{treesCount}</Badge>
        </div>
        <Separator />
        <Button onClick={onCreateTestFile} variant="outlined" size="small">
          <FilePlus />
          {reduxIntegrationCopy.cards.indexedDb.labels.createTestFile}
        </Button>
      </CardContent>
    </Card>
  )
}
