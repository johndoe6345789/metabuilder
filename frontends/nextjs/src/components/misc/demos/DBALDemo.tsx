/**
 * DBAL Demo Component
 *
 * Demonstrates the integration of the DBAL TypeScript client
 * with the MetaBuilder application.
 */

import { useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useDBAL } from '@/hooks/use-dbal/use-dbal'
import { BlobStorageDemo } from './dbal/BlobStorageDemo'
import { CachedDataDemo } from './dbal/CachedDataDemo'
import { ConnectionForm } from './dbal/ConnectionForm'
import { KVStoreDemo } from './dbal/KVStoreDemo'
import { LogsPanel } from './dbal/LogsPanel'
import { ResultPanel } from './dbal/ResultPanel'
import { DBALTabConfig, DBAL_CONTAINER_CLASS, DBAL_TAB_GRID_CLASS } from './dbal/dbal-demo.utils'

const tabs: DBALTabConfig[] = [
  { value: 'kv', label: 'Key-Value Store', content: <KVStoreDemo /> },
  { value: 'blob', label: 'Blob Storage', content: <BlobStorageDemo /> },
  { value: 'cache', label: 'Cached Data', content: <CachedDataDemo /> },
]

export function DBALDemo() {
  const { isReady, error } = useDBAL()
  const [logs, setLogs] = useState<string[]>([])
  const [latestResult, setLatestResult] = useState<unknown>(null)

  const statusMessage = useMemo(() => {
    if (error) return `Error: ${error}`
    return isReady ? 'Connected' : 'Initializing...'
  }, [error, isReady])

  const handleConnect = (config: { endpoint: string; apiKey: string }) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(current => [...current, `${timestamp}: Connected to ${config.endpoint}`])
    setLatestResult({
      endpoint: config.endpoint,
      apiKey: config.apiKey ? '***' : 'Not provided',
      ready: isReady,
    })
  }

  return (
    <div className={DBAL_CONTAINER_CLASS}>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">DBAL Integration Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of the TypeScript DBAL client integrated with MetaBuilder
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <ConnectionForm
          defaultUrl={process.env.NEXT_PUBLIC_DBAL_ENDPOINT}
          defaultApiKey={process.env.NEXT_PUBLIC_DBAL_API_KEY}
          statusMessage={statusMessage}
          onConnect={handleConnect}
        />
        <ResultPanel
          title="Connection Details"
          result={latestResult}
          emptyLabel="Submit the form to log a connection"
        />
      </div>

      <div className="mb-6">
        <LogsPanel logs={logs} title="Demo Logs" />
      </div>

      <Tabs defaultValue={tabs[0].value} className="space-y-4">
        <TabsList className={DBAL_TAB_GRID_CLASS}>
          {tabs.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map(tab => (
          <TabsContent key={tab.value} value={tab.value} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
