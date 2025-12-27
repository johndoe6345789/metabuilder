import { Button } from '@/components/ui'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Play, ShieldCheck } from '@phosphor-icons/react'

interface LuaEditorToolbarProps {
  scriptName: string
  onScan: () => void
  onTest: () => void
  isExecuting: boolean
}

export function LuaEditorToolbar({ scriptName, onScan, onTest, isExecuting }: LuaEditorToolbarProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Edit Script: {scriptName}</CardTitle>
          <CardDescription>Write custom Lua logic</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onScan}>
            <ShieldCheck className="mr-2" size={16} />
            Security Scan
          </Button>
          <Button onClick={onTest} disabled={isExecuting}>
            <Play className="mr-2" size={16} />
            {isExecuting ? 'Executing...' : 'Test Script'}
          </Button>
        </div>
      </div>
    </CardHeader>
  )
}
