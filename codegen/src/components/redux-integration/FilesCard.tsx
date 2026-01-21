import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Trash } from '@phosphor-icons/react'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import { FileItem } from '@/store/slices/filesSlice'

type FilesCardProps = {
  files: FileItem[]
  onDeleteFile: (fileId: string) => void
}

export function FilesCard({ files, onDeleteFile }: FilesCardProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{reduxIntegrationCopy.files.title}</CardTitle>
        <CardDescription>{reduxIntegrationCopy.files.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>{reduxIntegrationCopy.files.empty}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border border-border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {file.path} • {reduxIntegrationCopy.files.updatedLabel}{' '}
                    {new Date(file.updatedAt).toLocaleString()}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onDeleteFile(file.id)}>
                  <Trash className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
