import { useState } from 'react'
import { Badge, Button } from '@/components/ui'
import { toast } from 'sonner'
import { useKVStore } from '@/hooks/useDBAL'
import { DemoCard, LabeledInput } from './dbalUtils'

export const KVStoreDemo = () => {
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
      <DemoCard title="Key-Value Operations" description="Store and retrieve simple key-value data">
        <LabeledInput
          id="key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="my-key"
          label="Key"
        />
        <LabeledInput
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="my-value"
          label="Value"
        />
        <LabeledInput
          id="ttl"
          type="number"
          value={ttl ?? ''}
          onChange={(e) => setTtl(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="3600"
          label="TTL (seconds, optional)"
        />
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
        {!kv.isReady && <Badge variant="outline">Initializing DBAL...</Badge>}
      </DemoCard>

      <DemoCard title="List Operations" description="Store and retrieve lists of items">
        <LabeledInput
          id="listKey"
          value={listKey}
          onChange={(e) => setListKey(e.target.value)}
          placeholder="my-list"
          label="List Key"
        />
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
      </DemoCard>
    </div>
  )
}
