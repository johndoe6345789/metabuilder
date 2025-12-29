import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import type { PackageCatalogData } from '@/lib/packages/core/package-catalog'
import type { InstalledPackage } from '@/lib/package-types'
import { Download, Star, Tag, Trash, User } from '@phosphor-icons/react'
import { DependenciesTab } from './tabs/DependenciesTab'
import { ScriptsTab } from './tabs/ScriptsTab'

interface PackageDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedPackage: PackageCatalogData | null
  installing: boolean
  onInstall: (packageId: string) => void
  onUninstall: (packageId: string) => void
  installedPackages: InstalledPackage[]
  getCatalogEntry: (packageId: string) => PackageCatalogData | undefined
}

export function PackageDetailsDialog({
  open,
  onOpenChange,
  selectedPackage,
  installing,
  onInstall,
  onUninstall,
  installedPackages,
  getCatalogEntry,
}: PackageDetailsDialogProps) {
  if (!selectedPackage) return null

  const { manifest, content } = selectedPackage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl flex-shrink-0">
              {manifest.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl">{manifest.name}</DialogTitle>
              <DialogDescription className="mt-1">{manifest.description}</DialogDescription>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary">{manifest.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Download size={14} />
                  <span>{manifest.downloadCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star size={14} weight="fill" className="text-yellow-500" />
                  <span>{manifest.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <Tabs defaultValue="overview" className="flex-1 flex flex-col">
          <div className="px-1">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="scripts">Scripts</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="flex-1 m-0">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-6 pr-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Author</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={16} />
                      <span>{manifest.author}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Version</h4>
                    <p className="text-sm text-muted-foreground">{manifest.version}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {manifest.tags.map(tag => (
                      <Badge key={tag} variant="outline">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Includes</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="font-medium text-sm">Data Models</div>
                      <div className="text-2xl font-bold text-primary">
                        {content.schemas.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="font-medium text-sm">Pages</div>
                      <div className="text-2xl font-bold text-primary">{content.pages.length}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="font-medium text-sm">Workflows</div>
                      <div className="text-2xl font-bold text-primary">
                        {content.workflows.length}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <div className="font-medium text-sm">Scripts</div>
                      <div className="text-2xl font-bold text-primary">
                        {content.luaScripts.length}
                      </div>
                    </div>
                  </div>
                </div>

                {content.schemas.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Data Models</h4>
                    <div className="space-y-2">
                      {content.schemas.map(schema => (
                        <div key={schema.name} className="p-3 rounded-lg border">
                          <div className="font-medium">{schema.displayName || schema.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {schema.fields.length} fields
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {content.pages.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Pages</h4>
                    <div className="space-y-2">
                      {content.pages.map(page => (
                        <div key={page.id} className="p-3 rounded-lg border">
                          <div className="font-medium">{page.title}</div>
                          <div className="text-sm text-muted-foreground font-mono">{page.path}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="dependencies" className="flex-1 m-0">
            <ScrollArea className="h-[50vh] pr-4">
              <DependenciesTab
                dependencies={manifest.dependencies}
                installedPackages={installedPackages}
                resolveCatalogEntry={getCatalogEntry}
              />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="scripts" className="flex-1 m-0">
            <ScrollArea className="h-[50vh] pr-4">
              <ScriptsTab scripts={content.luaScripts} />
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          {manifest.installed ? (
            <Button variant="destructive" onClick={() => onUninstall(manifest.id)}>
              <Trash size={16} className="mr-2" />
              Uninstall
            </Button>
          ) : (
            <Button onClick={() => onInstall(manifest.id)} disabled={installing}>
              <Download size={16} className="mr-2" />
              {installing ? 'Installing...' : 'Install Package'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
