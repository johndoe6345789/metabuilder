import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@metabuilder/fakemui/surfaces'
import { Label } from '@metabuilder/fakemui/atoms'
import { Switch } from '@metabuilder/fakemui/inputs'
import projectSettingsCopy from '@/data/project-settings.json'
import { NextJsConfigSectionProps } from '@/components/project-settings/types'

export function NextJsFeaturesCard({
  nextjsConfig,
  onNextjsConfigChange,
}: NextJsConfigSectionProps) {
  const { features } = projectSettingsCopy.nextjs

  return (
    <Card>
      <CardHeader>
        <CardTitle>{features.title}</CardTitle>
        <CardDescription>{features.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="ps-switch-list">
          {[
            { id: 'typescript', key: 'typescript' as const, item: features.items.typescript },
            { id: 'eslint', key: 'eslint' as const, item: features.items.eslint },
            { id: 'tailwind', key: 'tailwind' as const, item: features.items.tailwind },
            { id: 'src-dir', key: 'srcDirectory' as const, item: features.items.srcDirectory },
            { id: 'app-router', key: 'appRouter' as const, item: features.items.appRouter },
            { id: 'turbopack', key: 'turbopack' as const, item: features.items.turbopack },
          ].map(({ id, key, item }) => (
            <div key={id} className="ps-switch-row">
              <div className="ps-switch-info">
                <Label htmlFor={id}>{item.label}</Label>
                <p className="ps-switch-desc">{item.description}</p>
              </div>
              <Switch
                id={id}
                checked={!!nextjsConfig[key]}
                onChange={(e) =>
                  onNextjsConfigChange((current) => ({
                    ...current,
                    [key]: e.target.checked,
                  }))
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
