import { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Database, DB_KEYS } from '@/lib/database'
import type { ModelSchema } from '@/lib/types/schema-types'
import { toast } from 'sonner'
import {
  Database as DatabaseIcon,
  Users,
  Key,
  Lightning,
  Code,
  FileText,
  Table as TableIcon,
  ChatCircle,
  Tree,
  Gear,
} from '@phosphor-icons/react'
import { ActionToolbar } from './ActionToolbar'
import { ConnectionForm, type ConnectionDetails } from './ConnectionForm'
import { SchemaViewer } from './SchemaViewer'

interface DatabaseStats {
  users: number
  credentials: number
  workflows: number
  luaScripts: number
  pages: number
  schemas: number
  comments: number
  componentNodes: number
  componentConfigs: number
}

type ConnectionState = 'disconnected' | 'connecting' | 'connected'

export function DatabaseManager() {
  const [stats, setStats] = useState<DatabaseStats>({
    users: 0,
    credentials: 0,
    workflows: 0,
    luaScripts: 0,
    pages: 0,
    schemas: 0,
    comments: 0,
    componentNodes: 0,
    componentConfigs: 0,
  })
  const [schemas, setSchemas] = useState<ModelSchema[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [lastConnectedAt, setLastConnectedAt] = useState<Date | null>(null)

  const loadStats = useCallback(async () => {
    setIsLoading(true)
    try {
      const [
        users,
        credentials,
        workflows,
        luaScripts,
        pages,
        schemaData,
        comments,
        hierarchy,
        configs,
      ] = await Promise.all([
        Database.getUsers({ scope: 'all' }),
        Database.getCredentials(),
        Database.getWorkflows(),
        Database.getLuaScripts(),
        Database.getPages(),
        Database.getSchemas(),
        Database.getComments(),
        Database.getComponentHierarchy(),
        Database.getComponentConfigs(),
      ])

      setStats({
        users: users.length,
        credentials: Object.keys(credentials).length,
        workflows: workflows.length,
        luaScripts: luaScripts.length,
        pages: pages.length,
        schemas: schemaData.length,
        comments: comments.length,
        componentNodes: Object.keys(hierarchy).length,
        componentConfigs: Object.keys(configs).length,
      })
      setSchemas(schemaData)
    } catch (error) {
      console.error(error)
      toast.error('Failed to load database statistics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const handleClearDatabase = useCallback(async () => {
    if (
      !confirm('Are you sure you want to clear the entire database? This action cannot be undone!')
    ) {
      return
    }

    if (
      !confirm(
        'This will delete ALL data including users, workflows, and configurations. Are you absolutely sure?'
      )
    ) {
      return
    }

    try {
      await Database.clearDatabase()
      await Database.initializeDatabase()
      await loadStats()
      toast.success('Database cleared and reinitialized')
    } catch (error) {
      console.error(error)
      toast.error('Failed to clear database')
    }
  }, [loadStats])

  const handleExportDatabase = useCallback(async () => {
    try {
      const data = await Database.exportDatabase()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `database-export-${Date.now()}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Database exported successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to export database')
    }
  }, [])

  const handleImportDatabase = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async e => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        await Database.importDatabase(text)
        await loadStats()
        toast.success('Database imported successfully')
      } catch (error) {
        console.error(error)
        toast.error('Failed to import database')
      }
    }
    input.click()
  }, [loadStats])

  const handleConnect = useCallback(
    async (details: ConnectionDetails) => {
      setConnectionState('connecting')
      try {
        await Database.initializeDatabase()
        setConnectionState('connected')
        setLastConnectedAt(new Date())
        toast.success(
          `Connected to ${details.database || 'Metabuilder database'} via ${details.driver}`
        )
        await loadStats()
      } catch (error) {
        console.error(error)
        setConnectionState('disconnected')
        toast.error('Failed to initialize database connection')
      }
    },
    [loadStats]
  )

  const dbEntities = useMemo(
    () => [
      { key: 'users', icon: Users, label: 'Users', count: stats.users, color: 'text-blue-500' },
      {
        key: 'credentials',
        icon: Key,
        label: 'Credentials (SHA-512)',
        count: stats.credentials,
        color: 'text-amber-500',
      },
      {
        key: 'workflows',
        icon: Lightning,
        label: 'Workflows',
        count: stats.workflows,
        color: 'text-purple-500',
      },
      {
        key: 'luaScripts',
        icon: Code,
        label: 'Lua Scripts',
        count: stats.luaScripts,
        color: 'text-indigo-500',
      },
      { key: 'pages', icon: FileText, label: 'Pages', count: stats.pages, color: 'text-cyan-500' },
      {
        key: 'schemas',
        icon: TableIcon,
        label: 'Data Schemas',
        count: stats.schemas,
        color: 'text-green-500',
      },
      {
        key: 'comments',
        icon: ChatCircle,
        label: 'Comments',
        count: stats.comments,
        color: 'text-pink-500',
      },
      {
        key: 'componentNodes',
        icon: Tree,
        label: 'Component Hierarchy',
        count: stats.componentNodes,
        color: 'text-teal-500',
      },
      {
        key: 'componentConfigs',
        icon: Gear,
        label: 'Component Configs',
        count: stats.componentConfigs,
        color: 'text-orange-500',
      },
    ],
    [stats]
  )

  const totalRecords = useMemo(() => Object.values(stats).reduce((a, b) => a + b, 0), [stats])

  return (
    <div className="space-y-6">
      <ActionToolbar
        isLoading={isLoading}
        onRefresh={() => void loadStats()}
        onExport={handleExportDatabase}
        onImport={handleImportDatabase}
        onClear={handleClearDatabase}
      />

      <ConnectionForm
        onConnect={handleConnect}
        isConnecting={connectionState === 'connecting'}
        status={connectionState}
        lastConnectedAt={lastConnectedAt}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-dashed border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DatabaseIcon size={24} />
              Database Overview
            </CardTitle>
            <CardDescription>
              All data stored using SHA-512 password hashing and KV persistence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRecords}</div>
            <p className="text-sm text-muted-foreground">Total records across all entities</p>
          </CardContent>
        </Card>

        {dbEntities.map(entity => (
          <Card key={entity.key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{entity.label}</CardTitle>
              <entity.icon size={20} className={entity.color} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entity.count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {entity.count === 1 ? 'record' : 'records'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SchemaViewer schemas={schemas} dbKeys={DB_KEYS} />

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All passwords are hashed using SHA-512 before storage. Plain text passwords are never
            stored in the database. The credential store maintains a mapping of usernames to
            password hashes for secure authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
