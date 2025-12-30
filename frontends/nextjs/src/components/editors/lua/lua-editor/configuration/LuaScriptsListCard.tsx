import { Plus, Trash } from '@/fakemui/icons'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type { LuaScript } from '@/lib/level-types'

interface LuaScriptsListCardProps {
  scripts: LuaScript[]
  selectedScriptId: string | null
  onAddScript: () => void
  onDeleteScript: (id: string) => void
  onSelectScript: (id: string) => void
}

export const LuaScriptsListCard = ({
  scripts,
  selectedScriptId,
  onAddScript,
  onDeleteScript,
  onSelectScript,
}: LuaScriptsListCardProps) => (
  <Card className="md:col-span-1">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">Lua Scripts</CardTitle>
        <Button size="sm" onClick={onAddScript}>
          <Plus size={16} />
        </Button>
      </div>
      <CardDescription>Custom logic scripts</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        {scripts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No scripts yet. Create one to start.
          </p>
        ) : (
          scripts.map(script => (
            <div
              key={script.id}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedScriptId === script.id
                  ? 'bg-accent border-accent-foreground'
                  : 'hover:bg-muted border-border'
              }`}
              onClick={() => onSelectScript(script.id)}
            >
              <div>
                <div className="font-medium text-sm font-mono">{script.name}</div>
                <div className="text-xs text-muted-foreground">
                  {script.parameters.length} params
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={e => {
                  e.stopPropagation()
                  onDeleteScript(script.id)
                }}
              >
                <Trash size={14} />
              </Button>
            </div>
          ))
        )}
      </div>
    </CardContent>
  </Card>
)
