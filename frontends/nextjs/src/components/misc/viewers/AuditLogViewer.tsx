import { ChartLine, Clock, ShieldCheck, User, Warning } from '@phosphor-icons/react'
import { useEffect,useState } from 'react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import type { User as UserType } from '@/lib/level-types'
import { AuditLog,SecureDatabase, SecurityContext } from '@/lib/secure-db-layer'

interface AuditLogViewerProps {
  user: UserType
}

export function AuditLogViewer({ user }: AuditLogViewerProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    successful: 0,
    failed: 0,
    rateLimit: 0,
  })

  const ctx: SecurityContext = { user }

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await SecureDatabase.getAuditLogs(ctx, 100)
      setLogs(data)
      calculateStats(data)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logs: AuditLog[]) => {
    const stats = {
      total: logs.length,
      successful: logs.filter(l => l.success).length,
      failed: logs.filter(l => !l.success).length,
      rateLimit: logs.filter(l => l.errorMessage?.includes('Rate limit')).length,
    }
    setStats(stats)
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'CREATE':
        return 'bg-green-500'
      case 'READ':
        return 'bg-blue-500'
      case 'UPDATE':
        return 'bg-yellow-500'
      case 'DELETE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'user':
        return <User className="w-4 h-4" />
      case 'credential':
        return <ShieldCheck className="w-4 h-4" />
      default:
        return <ChartLine className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <ChartLine className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <ShieldCheck className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <Warning className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Rate Limited</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.rateLimit}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Audit Log</CardTitle>
          <CardDescription>
            Last 100 database operations with access control enforcement
          </CardDescription>
          <Button onClick={loadLogs} disabled={loading} size="sm" className="mt-2">
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-3">
              {logs.map(log => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    log.success ? 'bg-card' : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getResourceIcon(log.resource)}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getOperationColor(log.operation)}>{log.operation}</Badge>
                      <span className="text-sm font-medium">{log.resource}</span>
                      <span className="text-xs text-muted-foreground">{log.resourceId}</span>
                      {!log.success && (
                        <Badge variant="destructive" className="ml-auto">
                          Failed
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{log.username}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.ipAddress && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{log.ipAddress}</span>
                        </>
                      )}
                    </div>

                    {log.errorMessage && (
                      <div className="text-xs text-destructive">{log.errorMessage}</div>
                    )}
                  </div>
                </div>
              ))}

              {logs.length === 0 && !loading && (
                <div className="py-12 text-center text-muted-foreground">No audit logs found</div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
