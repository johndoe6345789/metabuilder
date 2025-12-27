import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { BlobStorageDemo } from './BlobStorageDemo'
import { CachedDataDemo } from './CachedDataDemo'
import { KVStoreDemo } from './KVStoreDemo'

export const DBALDemo = () => {
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
