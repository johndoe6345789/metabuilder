import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { NpmSettings } from '@/types/project'
import projectSettingsCopy from '@/data/project-settings.json'
import { Code, Plus, Trash } from '@phosphor-icons/react'

interface ScriptsTabProps {
  npmSettings: NpmSettings
  onAddScript: () => void
  onEditScript: (key: string, value: string) => void
  onDeleteScript: (key: string) => void
}

export function ScriptsTab({
  npmSettings,
  onAddScript,
  onEditScript,
  onDeleteScript,
}: ScriptsTabProps) {
  const copy = projectSettingsCopy.scripts
  const scripts = Object.entries(npmSettings.scripts)

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">{copy.title}</h3>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
        <Button onClick={onAddScript}>
          <Plus size={16} className="mr-2" />
          {copy.dialog.title.add}
        </Button>
      </div>

      <div className="space-y-2">
        {scripts.map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Code size={18} className="text-primary flex-shrink-0" />
                    <code className="font-semibold text-sm">{key}</code>
                  </div>
                  <code className="text-xs text-muted-foreground block truncate">{value}</code>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={() => onEditScript(key, value)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => onDeleteScript(key)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {scripts.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">{copy.empty}</p>
          </Card>
        )}
      </div>
    </div>
  )
}
