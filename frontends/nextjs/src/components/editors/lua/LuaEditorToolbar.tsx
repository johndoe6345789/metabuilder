import { Play, ShieldCheck } from '@phosphor-icons/react'

import { Button, CardDescription, CardHeader, CardTitle } from '@/components/ui'

interface LuaEditorToolbarProps {
  scriptName: string
  onScanCode: () => void
  onTestScript: () => void
  isExecuting: boolean
}

export const LuaEditorToolbar = ({
  scriptName,
  onScanCode,
  onTestScript,
  isExecuting,
}: LuaEditorToolbarProps) => (
  <CardHeader>
    <div className="flex items-center justify-between">
      <div>
        <CardTitle>Edit Script: {scriptName}</CardTitle>
        <CardDescription>Write custom Lua logic</CardDescription>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onScanCode}>
          <ShieldCheck className="mr-2" size={16} />
          Security Scan
        </Button>
        <Button onClick={onTestScript} disabled={isExecuting}>
          <Play className="mr-2" size={16} />
          {isExecuting ? 'Executing...' : 'Test Script'}
        </Button>
      </div>
    </div>
  </CardHeader>
)
