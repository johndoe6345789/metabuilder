import { Badge, Button, Card, CardContent, ScrollArea } from '@/components/ui'
import { CheckCircle, Trash } from '@/fakemui/icons'
import type { ErrorLog } from '@/lib/db/error-logs'

import { formatLogContext } from '../helpers/context'
import { getLevelColor, getLevelIcon } from '../helpers/levelStyles'

interface ErrorLogTableProps {
  logs: ErrorLog[]
  isSuperGod: boolean
  loading: boolean
  onResolve: (id: string) => void
  onDelete: (id: string) => void
}

export const ErrorLogTable = ({
  logs,
  isSuperGod,
  loading,
  onResolve,
  onDelete,
}: ErrorLogTableProps) => (
  <ScrollArea className="h-[600px] pr-4">
    <div className="space-y-3">
      {logs.length === 0 && !loading && (
        <div className="py-12 text-center text-gray-400">No error logs found</div>
      )}

      {logs.map(log => {
        const context = formatLogContext(log.context)

        return (
          <Card
            key={log.id}
            className={`bg-white/5 border-white/10 ${log.resolved ? 'opacity-60' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded ${getLevelColor(log.level)}`}>
                      {getLevelIcon(log.level)}
                    </div>
                    <Badge variant="outline" className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    {log.resolved && (
                      <Badge
                        variant="outline"
                        className="bg-green-500/20 text-green-400 border-green-500/50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </Badge>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    {isSuperGod && log.tenantId && (
                      <Badge
                        variant="outline"
                        className="bg-purple-500/20 text-purple-400 border-purple-500/50"
                      >
                        Tenant: {log.tenantId}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <p className="text-white font-medium">{log.message}</p>
                    {log.source && (
                      <p className="text-xs text-gray-400 mt-1">Source: {log.source}</p>
                    )}
                    {log.username && (
                      <p className="text-xs text-gray-400 mt-1">
                        User: {log.username} {log.userId && `(${log.userId})`}
                      </p>
                    )}
                  </div>

                  {log.stack && (
                    <details className="text-xs text-gray-400 bg-black/40 p-2 rounded">
                      <summary className="cursor-pointer hover:text-white">Stack trace</summary>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{log.stack}</pre>
                    </details>
                  )}

                  {context && (
                    <details className="text-xs text-gray-400 bg-black/40 p-2 rounded">
                      <summary className="cursor-pointer hover:text-white">Context</summary>
                      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">{context}</pre>
                    </details>
                  )}

                  {log.resolved && log.resolvedAt && (
                    <p className="text-xs text-green-400">
                      Resolved on {new Date(log.resolvedAt).toLocaleString()}
                      {log.resolvedBy && ` by ${log.resolvedBy}`}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {!log.resolved && (
                    <Button
                      onClick={() => onResolve(log.id)}
                      size="sm"
                      variant="outline"
                      className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve
                    </Button>
                  )}
                  <Button
                    onClick={() => onDelete(log.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  </ScrollArea>
)
