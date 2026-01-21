import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Database, FilePlus } from '@phosphor-icons/react'
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
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          {reduxIntegrationCopy.cards.indexedDb.title}
        </CardTitle>
        <CardDescription>{reduxIntegrationCopy.cards.indexedDb.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {reduxIntegrationCopy.cards.indexedDb.labels.files}
          </span>
          <Badge variant="outline">{filesCount}</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {reduxIntegrationCopy.cards.indexedDb.labels.componentTrees}
          </span>
          <Badge variant="outline">{treesCount}</Badge>
        </div>
        <Separator />
        <Button onClick={onCreateTestFile} variant="outline" size="sm" className="w-full">
          <FilePlus className="w-4 h-4 mr-2" />
          {reduxIntegrationCopy.cards.indexedDb.labels.createTestFile}
        </Button>
      </CardContent>
    </Card>
  )
}
