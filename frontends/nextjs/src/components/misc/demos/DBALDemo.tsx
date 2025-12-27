/**
 * DBAL Demo Component
 *
 * Demonstrates the integration of the DBAL TypeScript client
 * with the MetaBuilder application.
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { BlobStorageDemo } from './dbal/BlobStorageDemo'
import { CachedDataDemo } from './dbal/CachedDataDemo'
import { KVStoreDemo } from './dbal/KVStoreDemo'
import { DBALTabConfig, DBAL_CONTAINER_CLASS, DBAL_TAB_GRID_CLASS } from './dbal/dbal-demo.utils'

const tabs: DBALTabConfig[] = [
  { value: 'kv', label: 'Key-Value Store', content: <KVStoreDemo /> },
  { value: 'blob', label: 'Blob Storage', content: <BlobStorageDemo /> },
  { value: 'cache', label: 'Cached Data', content: <CachedDataDemo /> },
]

export function DBALDemo() {
  return (
    <div className={DBAL_CONTAINER_CLASS}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">DBAL Integration Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of the TypeScript DBAL client integrated with MetaBuilder
        </p>
      </div>

      <Tabs defaultValue={tabs[0].value} className="space-y-4">
        <TabsList className={DBAL_TAB_GRID_CLASS}>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
