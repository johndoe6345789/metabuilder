import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@metabuilder/fakemui/surfaces'
import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
import projectSettingsCopy from '@/data/project-settings.json'
import { NextJsConfigSectionProps } from '@/components/project-settings/types'

export function NextJsApplicationCard({
  nextjsConfig,
  onNextjsConfigChange,
}: NextJsConfigSectionProps) {
  const { application } = projectSettingsCopy.nextjs

  return (
    <Card>
      <CardHeader>
        <CardTitle>{application.title}</CardTitle>
        <CardDescription>{application.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="ps-card-fields">
          <div className="ps-card-field">
            <Label htmlFor="app-name">{application.fields.appName.label}</Label>
            <Input
              id="app-name"
              value={nextjsConfig.appName}
              onChange={(e) =>
                onNextjsConfigChange((current) => ({
                  ...current,
                  appName: e.target.value,
                }))
              }
              placeholder={application.fields.appName.placeholder}
            />
          </div>

          <div className="ps-card-field">
            <Label htmlFor="import-alias">{application.fields.importAlias.label}</Label>
            <Input
              id="import-alias"
              value={nextjsConfig.importAlias}
              onChange={(e) =>
                onNextjsConfigChange((current) => ({
                  ...current,
                  importAlias: e.target.value,
                }))
              }
              placeholder={application.fields.importAlias.placeholder}
            />
            <p className="ps-helper-text">{application.fields.importAlias.helper}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
