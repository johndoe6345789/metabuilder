import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Database } from '@/lib/database'
import { PACKAGE_CATALOG } from '@/lib/package-catalog'
import type { PackageManifest, PackageContent, InstalledPackage } from '@/lib/package-types'
import { Package, Download, Trash, Power, MagnifyingGlass, Star, Tag, User, TrendUp, Funnel, Export, ArrowSquareIn } from '@phosphor-icons/react'
import { PackageImportExport } from './PackageImportExport'

interface PackageManagerProps {
  onClose?: () => void
}

export function PackageManager({ onClose }: PackageManagerProps) {
  const [packages, setPackages] = useState<PackageManifest[]>([])
  const [installedPackages, setInstalledPackages] = useState<InstalledPackage[]>([])
  const [selectedPackage, setSelectedPackage] = useState<{ manifest: PackageManifest; content: PackageContent } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'downloads' | 'rating'>('downloads')
  const [showDetails, setShowDetails] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('export')

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    const installed = await Database.getInstalledPackages()
    setInstalledPackages(installed)

    const allPackages = Object.values(PACKAGE_CATALOG).map(pkg => ({
      ...pkg.manifest,
      installed: installed.some(ip => ip.packageId === pkg.manifest.id),
    }))

    setPackages(allPackages)
  }

  const handleInstallPackage = async (packageId: string) => {
    setInstalling(true)
    try {
      const packageEntry = PACKAGE_CATALOG[packageId]
      if (!packageEntry) {
        toast.error('Package not found')
        return
      }

      const { content, manifest } = packageEntry

      const currentSchemas = await Database.getSchemas()
      const currentPages = await Database.getPages()
      const currentWorkflows = await Database.getWorkflows()
      const currentLuaScripts = await Database.getLuaScripts()
      const currentHierarchy = await Database.getComponentHierarchy()
      const currentConfigs = await Database.getComponentConfigs()

      const newSchemas = [...currentSchemas, ...content.schemas]
      const newPages = [...currentPages, ...content.pages]
      const newWorkflows = [...currentWorkflows, ...content.workflows]
      const newLuaScripts = [...currentLuaScripts, ...content.luaScripts]
      const newHierarchy = { ...currentHierarchy, ...content.componentHierarchy }
      const newConfigs = { ...currentConfigs, ...content.componentConfigs }

      await Database.setSchemas(newSchemas)
      await Database.setPages(newPages)
      await Database.setWorkflows(newWorkflows)
      await Database.setLuaScripts(newLuaScripts)
      await Database.setComponentHierarchy(newHierarchy)
      await Database.setComponentConfigs(newConfigs)

      if (content.cssClasses) {
        const currentCssClasses = await Database.getCssClasses()
        await Database.setCssClasses([...currentCssClasses, ...content.cssClasses])
      }

      if (content.dropdownConfigs) {
        const currentDropdowns = await Database.getDropdownConfigs()
        await Database.setDropdownConfigs([...currentDropdowns, ...content.dropdownConfigs])
      }

      if (content.seedData) {
        await Database.setPackageData(packageId, content.seedData)
      }

      const installedPackage: InstalledPackage = {
        packageId: manifest.id,
        installedAt: Date.now(),
        version: manifest.version,
        enabled: true,
      }

      await Database.installPackage(installedPackage)

      toast.success(`${manifest.name} installed successfully!`)
      await loadPackages()
      setShowDetails(false)
    } catch (error) {
      console.error('Installation error:', error)
      toast.error('Failed to install package')
    } finally {
      setInstalling(false)
    }
  }

  const handleUninstallPackage = async (packageId: string) => {
    try {
      const packageEntry = PACKAGE_CATALOG[packageId]
      if (!packageEntry) {
        toast.error('Package not found')
        return
      }

      const { content, manifest } = packageEntry

      const currentSchemas = await Database.getSchemas()
      const currentPages = await Database.getPages()
      const currentWorkflows = await Database.getWorkflows()
      const currentLuaScripts = await Database.getLuaScripts()

      const packageSchemaNames = content.schemas.map(s => s.name)
      const packagePageIds = content.pages.map(p => p.id)
      const packageWorkflowIds = content.workflows.map(w => w.id)
      const packageLuaIds = content.luaScripts.map(l => l.id)

      const filteredSchemas = currentSchemas.filter(s => !packageSchemaNames.includes(s.name))
      const filteredPages = currentPages.filter(p => !packagePageIds.includes(p.id))
      const filteredWorkflows = currentWorkflows.filter(w => !packageWorkflowIds.includes(w.id))
      const filteredLuaScripts = currentLuaScripts.filter(l => !packageLuaIds.includes(l.id))

      await Database.setSchemas(filteredSchemas)
      await Database.setPages(filteredPages)
      await Database.setWorkflows(filteredWorkflows)
      await Database.setLuaScripts(filteredLuaScripts)

      await Database.deletePackageData(packageId)
      await Database.uninstallPackage(packageId)

      toast.success(`${manifest.name} uninstalled successfully!`)
      await loadPackages()
      setShowDetails(false)
    } catch (error) {
      console.error('Uninstallation error:', error)
      toast.error('Failed to uninstall package')
    }
  }

  const handleTogglePackage = async (packageId: string, enabled: boolean) => {
    try {
      await Database.togglePackageEnabled(packageId, enabled)
      toast.success(enabled ? 'Package enabled' : 'Package disabled')
      await loadPackages()
    } catch (error) {
      console.error('Toggle error:', error)
      toast.error('Failed to toggle package')
    }
  }

  const filteredPackages = packages
    .filter(pkg => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pkg.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = categoryFilter === 'all' || pkg.category === categoryFilter

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'downloads') return b.downloadCount - a.downloadCount
      if (sortBy === 'rating') return b.rating - a.rating
      return 0
    })

  const categories = ['all', ...Array.from(new Set(packages.map(p => p.category)))]

  const installedList = packages.filter(p => p.installed)
  const availableList = packages.filter(p => !p.installed)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <Package size={24} weight="duotone" className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Package Manager</h2>
            <p className="text-sm text-muted-foreground">Install pre-built applications and features</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              setImportExportMode('import')
              setShowImportExport(true)
            }}
          >
            <ArrowSquareIn size={16} className="mr-2" />
            Import
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              setImportExportMode('export')
              setShowImportExport(true)
            }}
          >
            <Export size={16} className="mr-2" />
            Export
          </Button>
          {onClose && (
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="all" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Packages</TabsTrigger>
              <TabsTrigger value="installed">
                Installed ({installedList.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available ({availableList.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 py-4 space-y-3 border-b">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Funnel size={16} className="mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <TrendUp size={16} className="mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TabsContent value="all" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPackages.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    isInstalled={pkg.installed}
                    installedPackage={installedPackages.find(ip => ip.packageId === pkg.id)}
                    onViewDetails={() => {
                      setSelectedPackage(PACKAGE_CATALOG[pkg.id])
                      setShowDetails(true)
                    }}
                    onToggle={handleTogglePackage}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="installed" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {installedList.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Package size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No packages installed yet</p>
                  </div>
                ) : (
                  installedList.map(pkg => (
                    <PackageCard
                      key={pkg.id}
                      package={pkg}
                      isInstalled={true}
                      installedPackage={installedPackages.find(ip => ip.packageId === pkg.id)}
                      onViewDetails={() => {
                        setSelectedPackage(PACKAGE_CATALOG[pkg.id])
                        setShowDetails(true)
                      }}
                      onToggle={handleTogglePackage}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="available" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableList.map(pkg => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    isInstalled={false}
                    installedPackage={undefined}
                    onViewDetails={() => {
                      setSelectedPackage(PACKAGE_CATALOG[pkg.id])
                      setShowDetails(true)
                    }}
                    onToggle={handleTogglePackage}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {selectedPackage && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl flex-shrink-0">
                    {selectedPackage.manifest.icon}
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedPackage.manifest.name}</DialogTitle>
                    <DialogDescription className="mt-1">{selectedPackage.manifest.description}</DialogDescription>
                    <div className="flex items-center gap-3 mt-3">
                      <Badge variant="secondary">{selectedPackage.manifest.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download size={14} />
                        <span>{selectedPackage.manifest.downloadCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star size={14} weight="fill" className="text-yellow-500" />
                        <span>{selectedPackage.manifest.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Separator className="my-4" />

              <ScrollArea className="flex-1">
                <div className="space-y-6 pr-4">
                  <div>
                    <h4 className="font-semibold mb-2">Author</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User size={16} />
                      <span>{selectedPackage.manifest.author}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Version</h4>
                    <p className="text-sm text-muted-foreground">{selectedPackage.manifest.version}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPackage.manifest.tags.map(tag => (
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
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.schemas.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Pages</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.pages.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Workflows</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.workflows.length}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="font-medium text-sm">Scripts</div>
                        <div className="text-2xl font-bold text-primary">{selectedPackage.content.luaScripts.length}</div>
                      </div>
                    </div>
                  </div>

                  {selectedPackage.content.schemas.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Data Models</h4>
                      <div className="space-y-2">
                        {selectedPackage.content.schemas.map(schema => (
                          <div key={schema.name} className="p-3 rounded-lg border">
                            <div className="font-medium">{schema.displayName || schema.name}</div>
                            <div className="text-sm text-muted-foreground">{schema.fields.length} fields</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPackage.content.pages.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Pages</h4>
                      <div className="space-y-2">
                        {selectedPackage.content.pages.map(page => (
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

              <DialogFooter className="mt-4">
                {selectedPackage.manifest.installed ? (
                  <Button variant="destructive" onClick={() => handleUninstallPackage(selectedPackage.manifest.id)}>
                    <Trash size={16} className="mr-2" />
                    Uninstall
                  </Button>
                ) : (
                  <Button onClick={() => handleInstallPackage(selectedPackage.manifest.id)} disabled={installing}>
                    <Download size={16} className="mr-2" />
                    {installing ? 'Installing...' : 'Install Package'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <PackageImportExport 
        open={showImportExport}
        onOpenChange={(open) => {
          setShowImportExport(open)
          if (!open) {
            loadPackages()
          }
        }}
        mode={importExportMode}
      />
    </div>
  )
}

interface PackageCardProps {
  package: PackageManifest
  isInstalled: boolean
  installedPackage?: InstalledPackage
  onViewDetails: () => void
  onToggle: (packageId: string, enabled: boolean) => void
}

function PackageCard({ package: pkg, isInstalled, installedPackage, onViewDetails, onToggle }: PackageCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-2xl flex-shrink-0">
            {pkg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{pkg.name}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">{pkg.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{pkg.category}</Badge>
          {isInstalled && (
            <Badge variant={installedPackage?.enabled ? 'default' : 'outline'}>
              {installedPackage?.enabled ? 'Active' : 'Disabled'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Download size={14} />
            <span>{pkg.downloadCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={14} weight="fill" className="text-yellow-500" />
            <span>{pkg.rating}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button variant="outline" onClick={onViewDetails} className="flex-1">
          View Details
        </Button>
        {isInstalled && installedPackage && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggle(pkg.id, !installedPackage.enabled)}
            title={installedPackage.enabled ? 'Disable' : 'Enable'}
          >
            <Power size={18} weight={installedPackage.enabled ? 'fill' : 'regular'} />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
