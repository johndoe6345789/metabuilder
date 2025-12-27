import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Label } from '@/components/ui'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import type { LuaExecutionResult } from '@/lib/lua-engine'

interface LuaExecutionResultCardProps {
  result: LuaExecutionResult
}

export function LuaExecutionResultCard({ result }: LuaExecutionResultCardProps) {
  return (
    <Card className={result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle size={20} className="text-green-600" />
          ) : (
            <XCircle size={20} className="text-red-600" />
          )}
          <CardTitle className="text-sm">
            {result.success ? 'Execution Successful' : 'Execution Failed'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {result.error && (
          <div>
            <Label className="text-xs text-red-600 mb-1">Error</Label>
            <pre className="text-xs font-mono whitespace-pre-wrap text-red-700 bg-red-100 p-2 rounded">{result.error}</pre>
          </div>
        )}

        {result.logs.length > 0 && (
          <div>
            <Label className="text-xs mb-1">Logs</Label>
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded">{result.logs.join('\n')}</pre>
          </div>
        )}

        {result.result !== null && result.result !== undefined && (
          <div>
            <Label className="text-xs mb-1">Return Value</Label>
            <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
