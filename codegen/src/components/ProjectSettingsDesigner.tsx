import { NextJsConfig, NpmSettings } from '@/types/project'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Cube } from '@phosphor-icons/react'
import projectSettingsCopy from '@/data/project-settings.json'
import { NextJsConfigTab } from '@/components/project-settings/NextJsConfigTab'
import { PackagesTab } from '@/components/project-settings/PackagesTab'
import { ScriptsTab } from '@/components/project-settings/ScriptsTab'
import { DataTab } from '@/components/project-settings/DataTab'
import { PackageDialog } from '@/components/project-settings/PackageDialog'
import { ScriptDialog } from '@/components/project-settings/ScriptDialog'
import { useProjectSettingsActions } from '@/components/project-settings/useProjectSettingsActions'

interface ProjectSettingsDesignerProps {
  nextjsConfig: NextJsConfig
  npmSettings: NpmSettings
  onNextjsConfigChange: (config: NextJsConfig | ((current: NextJsConfig) => NextJsConfig)) => void
  onNpmSettingsChange: (settings: NpmSettings | ((current: NpmSettings) => NpmSettings)) => void
}

export function ProjectSettingsDesigner({
  nextjsConfig,
  npmSettings,
  onNextjsConfigChange,
  onNpmSettingsChange,
}: ProjectSettingsDesignerProps) {
  const {
    packageDialogOpen,
    setPackageDialogOpen,
    editingPackage,
    setEditingPackage,
    scriptDialogOpen,
    setScriptDialogOpen,
    scriptKey,
    setScriptKey,
    scriptValue,
    setScriptValue,
    editingScriptKey,
    handleAddPackage,
    handleEditPackage,
    handleSavePackage,
    handleDeletePackage,
    handleAddScript,
    handleEditScript,
    handleSaveScript,
    handleDeleteScript,
  } = useProjectSettingsActions({ onNpmSettingsChange })

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <Cube size={24} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{projectSettingsCopy.header.title}</h2>
            <p className="text-sm text-muted-foreground">
              {projectSettingsCopy.header.description}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="nextjs" className="flex-1 flex flex-col">
        <div className="border-b border-border px-6">
          <TabsList>
            <TabsTrigger value="nextjs">{projectSettingsCopy.tabs.nextjs}</TabsTrigger>
            <TabsTrigger value="packages">{projectSettingsCopy.tabs.packages}</TabsTrigger>
            <TabsTrigger value="scripts">{projectSettingsCopy.tabs.scripts}</TabsTrigger>
            <TabsTrigger value="data">{projectSettingsCopy.tabs.data}</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6">
            <TabsContent value="nextjs" className="mt-0">
              <NextJsConfigTab
                nextjsConfig={nextjsConfig}
                onNextjsConfigChange={onNextjsConfigChange}
              />
            </TabsContent>

            <TabsContent value="packages" className="mt-0">
              <PackagesTab
                npmSettings={npmSettings}
                onNpmSettingsChange={onNpmSettingsChange}
                onAddPackage={handleAddPackage}
                onEditPackage={handleEditPackage}
                onDeletePackage={handleDeletePackage}
              />
            </TabsContent>

            <TabsContent value="scripts" className="mt-0">
              <ScriptsTab
                npmSettings={npmSettings}
                onAddScript={handleAddScript}
                onEditScript={handleEditScript}
                onDeleteScript={handleDeleteScript}
              />
            </TabsContent>

            <TabsContent value="data" className="mt-0">
              <DataTab />
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>

      <PackageDialog
        open={packageDialogOpen}
        onOpenChange={setPackageDialogOpen}
        editingPackage={editingPackage}
        setEditingPackage={setEditingPackage}
        onSave={handleSavePackage}
      />

      <ScriptDialog
        open={scriptDialogOpen}
        onOpenChange={setScriptDialogOpen}
        scriptKey={scriptKey}
        scriptValue={scriptValue}
        setScriptKey={setScriptKey}
        setScriptValue={setScriptValue}
        editingScriptKey={editingScriptKey}
        onSave={handleSaveScript}
      />
    </div>
  )
}
