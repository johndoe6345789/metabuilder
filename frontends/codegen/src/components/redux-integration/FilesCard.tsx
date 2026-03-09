import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Database, Trash } from '@metabuilder/fakemui/icons'
import reduxIntegrationCopy from '@/data/redux-integration-demo.json'
import { FileItem } from '@/store/slices/filesSlice'

type FilesCardProps = {
  files: FileItem[]
  onDeleteFile: (fileId: string) => void
}

export function FilesCard({ files, onDeleteFile }: FilesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{reduxIntegrationCopy.files.title}</CardTitle>
        <CardDescription>{reduxIntegrationCopy.files.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div>
            <Database />
            <p>{reduxIntegrationCopy.files.empty}</p>
          </div>
        ) : (
          <div>
            {files.map((file) => (
              <div key={file.id}>
                <div>
                  <div>{file.name}</div>
                  <div>
                    {file.path} • {reduxIntegrationCopy.files.updatedLabel}{' '}
                    {new Date(file.updatedAt).toLocaleString()}
                  </div>
                </div>
                <Button variant="text" size="small" onClick={() => onDeleteFile(file.id)}>
                  <Trash />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
