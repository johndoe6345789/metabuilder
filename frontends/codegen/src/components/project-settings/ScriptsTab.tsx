import { Button } from '@metabuilder/fakemui/inputs'
import { Card, CardContent } from '@metabuilder/fakemui/surfaces'
import { NpmSettings } from '@/types/project'
import projectSettingsCopy from '@/data/project-settings.json'
import { Code, Plus, Trash } from '@metabuilder/fakemui/icons'

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
    <div className="settings-tab">
      <div className="settings-tab__header">
        <div>
          <h3 className="settings-tab__title">{copy.title}</h3>
          <p className="settings-tab__description">{copy.description}</p>
        </div>
        <Button onClick={onAddScript}>
          <Plus size={16} />
          {copy.dialog.title.add}
        </Button>
      </div>

      <div className="settings-tab__list">
        {scripts.map(([key, value]) => (
          <Card key={key}>
            <CardContent>
              <div className="settings-tab__script-row">
                <div className="settings-tab__script-info">
                  <div className="settings-tab__script-name">
                    <Code size={16} />
                    <code>{key}</code>
                  </div>
                  <code className="settings-tab__script-value">{value}</code>
                </div>
                <div className="settings-tab__script-actions">
                  <Button size="small" variant="outlined" onClick={() => onEditScript(key, value)}>
                    Edit
                  </Button>
                  <Button size="small" variant="text" onClick={() => onDeleteScript(key)}>
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {scripts.length === 0 && (
          <Card>
            <CardContent>
              <p className="settings-tab__empty">{copy.empty}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
