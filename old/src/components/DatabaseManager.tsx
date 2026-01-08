import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Database, DB_KEYS } from '@/lib/database'
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
  Trash,
  ArrowsClockwise,
} from '@phosphor-icons/react'

export function DatabaseManager() {
  const [stats, setStats] = useState({
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

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const [
        users,
        credentials,
        workflows,
        luaScripts,
        pages,
        schemas,
        comments,
        hierarchy,
        configs,
      ] = await Promise.all([
        Database.getUsers(),
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
        schemas: schemas.length,
        comments: comments.length,
        componentNodes: Object.keys(hierarchy).length,
        componentConfigs: Object.keys(configs).length,
      })
    } catch (error) {
      toast.error('Failed to load database statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearDatabase = async () => {
    if (!confirm('Are you sure you want to clear the entire database? This action cannot be undone!')) {
      return
    }

    if (!confirm('This will delete ALL data including users, workflows, and configurations. Are you absolutely sure?')) {
      return
    }

    try {
      await Database.clearDatabase()
      await Database.initializeDatabase()
      await loadStats()
      toast.success('Database cleared and reinitialized')
    } catch (error) {
      toast.error('Failed to clear database')
    }
  }

  const handleExportDatabase = async () => {
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
      toast.error('Failed to export database')
    }
  }

  const handleImportDatabase = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        await Database.importDatabase(text)
        await loadStats()
        toast.success('Database imported successfully')
      } catch (error) {
        toast.error('Failed to import database')
      }
    }
    input.click()
  }

  const totalRecords = Object.values(stats).reduce((a, b) => a + b, 0)

  const dbEntities = [
    { key: 'users', icon: Users, label: 'Users', count: stats.users, color: 'text-blue-500' },
    { key: 'credentials', icon: Key, label: 'Credentials (SHA-512)', count: stats.credentials, color: 'text-amber-500' },
    { key: 'workflows', icon: Lightning, label: 'Workflows', count: stats.workflows, color: 'text-purple-500' },
    { key: 'luaScripts', icon: Code, label: 'Lua Scripts', count: stats.luaScripts, color: 'text-indigo-500' },
    { key: 'pages', icon: FileText, label: 'Pages', count: stats.pages, color: 'text-cyan-500' },
    { key: 'schemas', icon: TableIcon, label: 'Data Schemas', count: stats.schemas, color: 'text-green-500' },
    { key: 'comments', icon: ChatCircle, label: 'Comments', count: stats.comments, color: 'text-pink-500' },
    { key: 'componentNodes', icon: Tree, label: 'Component Hierarchy', count: stats.componentNodes, color: 'text-teal-500' },
    { key: 'componentConfigs', icon: Gear, label: 'Component Configs', count: stats.componentConfigs, color: 'text-orange-500' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Management</h2>
          <p className="text-muted-foreground">
            Manage all persistent data across the application
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadStats} disabled={isLoading}>
            <ArrowsClockwise size={16} className={isLoading ? 'animate-spin' : ''} />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportDatabase}>
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportDatabase}>
            Import
          </Button>
          <Button variant="destructive" size="sm" onClick={handleClearDatabase}>
            <Trash className="mr-2" size={16} />
            Clear DB
          </Button>
        </div>
      </div>

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

        {dbEntities.map((entity) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Database Keys</CardTitle>
          <CardDescription>
            All KV storage keys used by the application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {Object.entries(DB_KEYS).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <span className="font-mono text-sm font-medium">{key}</span>
                    <p className="text-xs text-muted-foreground mt-1">{value}</p>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    KV
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key size={20} />
            Password Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All passwords are hashed using SHA-512 before storage. Plain text passwords are never stored in the database.
            The credential store maintains a mapping of usernames to password hashes for secure authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
