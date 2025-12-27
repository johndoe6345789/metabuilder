import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Plus, Trash } from '@phosphor-icons/react'
import type { LuaScript } from '@/lib/level-types'

interface LuaScriptsSidebarProps {
  scripts: LuaScript[]
  selectedScript: string | null
  onSelect: (scriptId: string) => void
  onAdd: () => void
  onDelete: (scriptId: string) => void
}

export function LuaScriptsSidebar({ scripts, selectedScript, onSelect, onAdd, onDelete }: LuaScriptsSidebarProps) {
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Lua Scripts</CardTitle>
          <Button size="sm" onClick={onAdd}>
            <Plus size={16} />
          </Button>
        </div>
        <CardDescription>Custom logic scripts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {scripts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No scripts yet. Create one to start.</p>
          ) : (
            scripts.map(script => (
              <div
                key={script.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedScript === script.id ? 'bg-accent border-accent-foreground' : 'hover:bg-muted border-border'
                }`}
                onClick={() => onSelect(script.id)}
              >
                <div>
                  <div className="font-medium text-sm font-mono">{script.name}</div>
                  <div className="text-xs text-muted-foreground">{script.parameters.length} params</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={event => {
                    event.stopPropagation()
                    onDelete(script.id)
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
}
