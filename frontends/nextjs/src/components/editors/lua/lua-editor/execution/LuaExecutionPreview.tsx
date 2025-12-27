import { CheckCircle, XCircle } from '@phosphor-icons/react'
import { Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui'
import type { LuaExecutionResult } from '@/lib/lua-engine'

interface LuaExecutionPreviewProps {
  result: LuaExecutionResult | null
}

export const LuaExecutionPreview = ({ result }: LuaExecutionPreviewProps) => {
  return (
    <div className="space-y-4">
      {result && (
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
                <pre className="text-xs font-mono whitespace-pre-wrap text-red-700 bg-red-100 p-2 rounded">
                  {result.error}
                </pre>
              </div>
            )}

            {result.logs.length > 0 && (
              <div>
                <Label className="text-xs mb-1">Logs</Label>
                <pre className="text-xs font-mono whitespace-pre-wrap bg-muted p-2 rounded">
                  {result.logs.join('\n')}
                </pre>
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
      )}

      <div className="bg-muted/50 rounded-lg p-4 border border-dashed space-y-2 text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">Available in context:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><code className="font-mono">context.data</code> - Input data</li>
          <li><code className="font-mono">context.user</code> - Current user info</li>
          <li><code className="font-mono">context.kv</code> - Key-value storage</li>
          <li><code className="font-mono">context.log(msg)</code> - Logging function</li>
        </ul>
      </div>
    </div>
  )
}
