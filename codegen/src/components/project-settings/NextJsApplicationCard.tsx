import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      <CardContent className="space-y-4">
        <div>
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

        <div>
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
          <p className="text-xs text-muted-foreground mt-1">
            {application.fields.importAlias.helper}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
