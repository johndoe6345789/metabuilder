import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="typescript">{features.items.typescript.label}</Label>
            <p className="text-xs text-muted-foreground">
              {features.items.typescript.description}
            </p>
          </div>
          <Switch
            id="typescript"
            checked={nextjsConfig.typescript}
            onCheckedChange={(checked) =>
              onNextjsConfigChange((current) => ({
                ...current,
                typescript: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="eslint">{features.items.eslint.label}</Label>
            <p className="text-xs text-muted-foreground">{features.items.eslint.description}</p>
          </div>
          <Switch
            id="eslint"
            checked={nextjsConfig.eslint}
            onCheckedChange={(checked) =>
              onNextjsConfigChange((current) => ({
                ...current,
                eslint: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="tailwind">{features.items.tailwind.label}</Label>
            <p className="text-xs text-muted-foreground">
              {features.items.tailwind.description}
            </p>
          </div>
          <Switch
            id="tailwind"
            checked={nextjsConfig.tailwind}
            onCheckedChange={(checked) =>
              onNextjsConfigChange((current) => ({
                ...current,
                tailwind: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="src-dir">{features.items.srcDirectory.label}</Label>
            <p className="text-xs text-muted-foreground">
              {features.items.srcDirectory.description}
            </p>
          </div>
          <Switch
            id="src-dir"
            checked={nextjsConfig.srcDirectory}
            onCheckedChange={(checked) =>
              onNextjsConfigChange((current) => ({
                ...current,
                srcDirectory: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="app-router">{features.items.appRouter.label}</Label>
            <p className="text-xs text-muted-foreground">
              {features.items.appRouter.description}
            </p>
          </div>
          <Switch
            id="app-router"
            checked={nextjsConfig.appRouter}
            onCheckedChange={(checked) =>
              onNextjsConfigChange((current) => ({
                ...current,
                appRouter: checked,
              }))
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="turbopack">{features.items.turbopack.label}</Label>
            <p className="text-xs text-muted-foreground">
              {features.items.turbopack.description}
            </p>
          </div>
          <Switch
            id="turbopack"
            checked={nextjsConfig.turbopack || false}
            onCheckedChange={(checked) =>
              onNextjsConfigChange((current) => ({
                ...current,
                turbopack: checked,
              }))
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
