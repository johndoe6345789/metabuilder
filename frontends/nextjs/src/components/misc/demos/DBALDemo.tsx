/**
 * DBAL Demo Component
 * 
 * Demonstrates the integration of the DBAL TypeScript client
 * with the MetaBuilder application.
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Badge } from '@/components/ui'
import { toast } from 'sonner'
import { useKVStore, useBlobStorage, useCachedData } from '@/hooks/useDBAL'

export function DBALDemo() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">DBAL Integration Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of the TypeScript DBAL client integrated with MetaBuilder
        </p>
      </div>

      <Tabs defaultValue="kv" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kv">Key-Value Store</TabsTrigger>
          <TabsTrigger value="blob">Blob Storage</TabsTrigger>
          <TabsTrigger value="cache">Cached Data</TabsTrigger>
        </TabsList>

        <TabsContent value="kv" className="space-y-4">
          <KVStoreDemo />
        </TabsContent>

        <TabsContent value="blob" className="space-y-4">
          <BlobStorageDemo />
        </TabsContent>

        <TabsContent value="cache" className="space-y-4">
          <CachedDataDemo />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function KVStoreDemo() {
  const kv = useKVStore()
  const [key, setKey] = useState('demo-key')
  const [value, setValue] = useState('Hello, DBAL!')
  const [ttl, setTtl] = useState<number | undefined>(undefined)
  const [retrievedValue, setRetrievedValue] = useState<string | null>(null)
  const [listKey, setListKey] = useState('demo-list')
  const [listItems, setListItems] = useState<string[]>([])

  const handleSet = async () => {
    try {
      await kv.set(key, value, ttl)
      toast.success(`Stored: ${key} = ${value}`)
    } catch (error) {
      console.error('KV Set Error:', error)
    }
  }

  const handleGet = async () => {
    try {
      const result = await kv.get<string>(key)
      setRetrievedValue(result)
      if (result) {
        toast.success(`Retrieved: ${result}`)
      } else {
        toast.info('Key not found')
      }
    } catch (error) {
      console.error('KV Get Error:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const deleted = await kv.delete(key)
      if (deleted) {
        toast.success(`Deleted: ${key}`)
        setRetrievedValue(null)
      } else {
        toast.info('Key not found')
      }
    } catch (error) {
      console.error('KV Delete Error:', error)
    }
  }

  const handleListAdd = async () => {
    try {
      await kv.listAdd(listKey, ['Item 1', 'Item 2', 'Item 3'])
      toast.success('Added items to list')
      handleListGet()
    } catch (error) {
      console.error('List Add Error:', error)
    }
  }

  const handleListGet = async () => {
    try {
      const items = await kv.listGet(listKey)
      setListItems(items)
      toast.success(`Retrieved ${items.length} items`)
    } catch (error) {
      console.error('List Get Error:', error)
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Key-Value Operations</CardTitle>
          <CardDescription>Store and retrieve simple key-value data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="key">Key</Label>
            <Input
              id="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="my-key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="my-value"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ttl">TTL (seconds, optional)</Label>
            <Input
              id="ttl"
              type="number"
              value={ttl || ''}
              onChange={(e) => setTtl(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="3600"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSet} disabled={!kv.isReady}>
              Set
            </Button>
            <Button onClick={handleGet} variant="secondary" disabled={!kv.isReady}>
              Get
            </Button>
            <Button onClick={handleDelete} variant="destructive" disabled={!kv.isReady}>
              Delete
            </Button>
          </div>
          {retrievedValue !== null && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-mono">{retrievedValue}</p>
            </div>
          )}
          {!kv.isReady && (
            <Badge variant="outline">Initializing DBAL...</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>List Operations</CardTitle>
          <CardDescription>Store and retrieve lists of items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listKey">List Key</Label>
            <Input
              id="listKey"
              value={listKey}
              onChange={(e) => setListKey(e.target.value)}
              placeholder="my-list"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleListAdd} disabled={!kv.isReady}>
              Add Items
            </Button>
            <Button onClick={handleListGet} variant="secondary" disabled={!kv.isReady}>
              Get Items
            </Button>
          </div>
          {listItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Items ({listItems.length}):</p>
              <div className="space-y-1">
                {listItems.map((item, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function BlobStorageDemo() {
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
      </CardContent>
    </Card>
  )
}

function CachedDataDemo() {
  interface UserPreferences {
    theme: string
    language: string
    notifications: boolean
  }

  const { data, loading, error, save, clear, isReady } = useCachedData<UserPreferences>(
    'user-preferences'
  )

  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('en')
  const [notifications, setNotifications] = useState(true)

  const handleSave = async () => {
    try {
      await save({ theme, language, notifications }, 3600) // Cache for 1 hour
      toast.success('Preferences saved')
    } catch (error) {
      console.error('Save Error:', error)
    }
  }

  const handleClear = async () => {
    try {
      await clear()
      toast.success('Cache cleared')
    } catch (error) {
      console.error('Clear Error:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cached Data Hook</CardTitle>
        <CardDescription>Automatic caching with React hooks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && <Badge variant="outline">Loading cached data...</Badge>}
        {error && <Badge variant="destructive">Error: {error}</Badge>}
        
        {data && (
          <div className="p-3 bg-muted rounded-md space-y-1">
            <p className="text-sm font-medium">Cached Preferences:</p>
            <p className="text-sm font-mono">Theme: {data.theme}</p>
            <p className="text-sm font-mono">Language: {data.language}</p>
            <p className="text-sm font-mono">Notifications: {data.notifications ? 'On' : 'Off'}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Input
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="dark"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="en"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="notifications">Enable Notifications</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!isReady}>
            Save to Cache
          </Button>
          <Button onClick={handleClear} variant="destructive" disabled={!isReady}>
            Clear Cache
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
