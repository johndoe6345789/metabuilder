import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import { useBlobStorage } from '@/hooks/useDBAL'
import { renderInitializationBadge } from './dbal-demo.utils'
import { toast } from 'sonner'

export function BlobStorageDemo() {
  const blob = useBlobStorage()
  const [fileName, setFileName] = useState('demo.txt')
  const [fileContent, setFileContent] = useState('Hello from DBAL blob storage!')
  const [files, setFiles] = useState<string[]>([])
  const [downloadedContent, setDownloadedContent] = useState<string | null>(null)

  const handleUpload = async () => {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(fileContent)
      await blob.upload(fileName, data, {
        'content-type': 'text/plain',
        'uploaded-at': new Date().toISOString(),
      })
      handleList()
    } catch (error) {
      console.error('Upload Error:', error)
    }
  }

  const handleDownload = async () => {
    try {
      const data = await blob.download(fileName)
      const decoder = new TextDecoder()
      const content = decoder.decode(data)
      setDownloadedContent(content)
      toast.success('Downloaded successfully')
    } catch (error) {
      console.error('Download Error:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await blob.delete(fileName)
      setDownloadedContent(null)
      handleList()
    } catch (error) {
      console.error('Delete Error:', error)
    }
  }

  const handleList = async () => {
    try {
      const fileList = await blob.list()
      setFiles(fileList)
      toast.success(`Found ${fileList.length} files`)
    } catch (error) {
      console.error('List Error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blob Storage Operations</CardTitle>
        <CardDescription>Upload, download, and manage binary data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fileName">File Name</Label>
          <Input
            id="fileName"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="file.txt"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileContent">Content</Label>
          <textarea
            id="fileContent"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            placeholder="File content..."
            className="w-full min-h-[100px] p-2 border rounded-md"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleUpload} disabled={!blob.isReady}>
            Upload
          </Button>
          <Button onClick={handleDownload} variant="secondary" disabled={!blob.isReady}>
            Download
          </Button>
          <Button onClick={handleDelete} variant="destructive" disabled={!blob.isReady}>
            Delete
          </Button>
          <Button onClick={handleList} variant="outline" disabled={!blob.isReady}>
            List Files
          </Button>
        </div>
        {downloadedContent && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Downloaded Content:</p>
            <div className="p-3 bg-muted rounded-md">
              <pre className="text-sm font-mono whitespace-pre-wrap">{downloadedContent}</pre>
            </div>
          </div>
        )}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Files ({files.length}):</p>
            <div className="space-y-1">
              {files.map((file) => (
                <div key={file} className="p-2 bg-muted rounded text-sm font-mono">
                  {file}
                </div>
              ))}
            </div>
          </div>
        )}
        {renderInitializationBadge(blob.isReady, 'Initializing DBAL...')}
      </CardContent>
    </Card>
  )
}
