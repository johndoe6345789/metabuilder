import { Button, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Play, ShieldCheck } from '@/fakemui/icons'
import type { LuaScript } from '@/lib/level-types'

interface LuaEditorToolbarProps {
  script: LuaScript
  isExecuting: boolean
  onScan: () => void
  onTest: () => void
}

export const LuaEditorToolbar = ({
  script,
  isExecuting,
  onScan,
  onTest,
}: LuaEditorToolbarProps) => (
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Edit Script: {script.name}</CardTitle>
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
