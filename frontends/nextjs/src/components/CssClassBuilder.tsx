import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/lib/database'
import { Plus, X, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface CssClassBuilderProps {
  open: boolean
  onClose: () => void
  initialValue?: string
  onSave: (classes: string) => void
}

interface CssCategory {
  name: string
  classes: string[]
}

const CLASS_TOKEN_PATTERN = /^[A-Za-z0-9:_/.[\]()%#!,=+-]+$/
const parseClassList = (value: string) => Array.from(new Set(value.split(/\s+/).filter(Boolean)))

export function CssClassBuilder({ open, onClose, initialValue = '', onSave }: CssClassBuilderProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [categories, setCategories] = useState<CssCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customClass, setCustomClass] = useState('')
  const [activeTab, setActiveTab] = useState('custom')

  const knownClassSet = useMemo(
    () => new Set(categories.flatMap((category) => category.classes)),
    [categories]
  )
  const selectedClassSet = useMemo(() => new Set(selectedClasses), [selectedClasses])
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) {
      return categories
    }

    return categories
      .map((category) => ({
        ...category,
        classes: category.classes.filter((cls) => cls.toLowerCase().includes(normalizedSearch)),
      }))
      .filter((category) => category.classes.length > 0)
  }, [categories, normalizedSearch])

  const customTokens = customClass.trim().split(/\s+/).filter(Boolean)
  const uniqueCustomTokens = Array.from(new Set(customTokens))
  const invalidCustomTokens = uniqueCustomTokens.filter((token) => !CLASS_TOKEN_PATTERN.test(token))
  const duplicateCustomTokens = uniqueCustomTokens.filter((token) => selectedClassSet.has(token))
  const unknownCustomTokens = uniqueCustomTokens.filter((token) => !knownClassSet.has(token))
  const canAddCustom =
    uniqueCustomTokens.length > 0 &&
    invalidCustomTokens.length === 0 &&
    uniqueCustomTokens.some((token) => !selectedClassSet.has(token))

  useEffect(() => {
    if (open) {
      loadCssClasses()
      setSelectedClasses(parseClassList(initialValue))
      setSearchQuery('')
      setCustomClass('')
    }
  }, [open, initialValue])

  useEffect(() => {
    if (!open) {
      return
    }

    if (filteredCategories.length === 0) {
      setActiveTab('custom')
      return
    }

    const hasActiveTab = filteredCategories.some((category) => category.name === activeTab)
    if (!hasActiveTab) {
      setActiveTab(filteredCategories[0]?.name ?? 'custom')
    }
  }, [activeTab, filteredCategories, open])

  const loadCssClasses = async () => {
    const classes = await Database.getCssClasses()
    const sorted = classes.slice().sort((a, b) => a.name.localeCompare(b.name))
    setCategories(sorted)
  }

  const toggleClass = (cssClass: string) => {
    setSelectedClasses(current => {
      if (current.includes(cssClass)) {
        return current.filter(c => c !== cssClass)
      } else {
        return [...current, cssClass]
      }
    })
  }

  const addCustomClass = () => {
    if (uniqueCustomTokens.length === 0) {
      return
    }

    if (invalidCustomTokens.length > 0) {
      toast.error(`Invalid class name: ${invalidCustomTokens.join(', ')}`)
      return
    }

    const newTokens = uniqueCustomTokens.filter((token) => !selectedClassSet.has(token))
    if (newTokens.length === 0) {
      toast.info('Those classes are already selected')
      return
    }

    setSelectedClasses((current) => [...current, ...newTokens])
    setCustomClass('')
  }

  const clearSelectedClasses = () => {
    setSelectedClasses([])
  }

  const handleSave = () => {
    onSave(selectedClasses.join(' '))
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">CSS Class Builder</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={16} />
              </Button>
            )}
          </div>

          {selectedClasses.length > 0 ? (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider">Selected Classes</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{selectedClasses.length} selected</span>
                  <Button size="sm" variant="ghost" onClick={clearSelectedClasses}>
                    Clear
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedClasses.map(cls => (
                  <Badge key={cls} variant="secondary" className="gap-2">
                    {cls}
                    <button
                      onClick={() => toggleClass(cls)}
                      className="hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="rounded border bg-background p-2 font-mono text-sm">
                {selectedClasses.join(' ')}
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-muted/30 text-sm text-muted-foreground">
              No classes selected yet. Choose classes to preview and apply.
            </div>
          )}

          <div className="p-4 border rounded-lg bg-muted/30 space-y-2">
            <Label className="text-xs uppercase tracking-wider">Preview</Label>
            <div className="rounded-md border border-dashed bg-background p-3">
              <div className={`rounded-md p-4 transition-all ${selectedClasses.join(' ')}`}>
                <div className="text-sm font-semibold">Preview element</div>
                <div className="text-xs text-muted-foreground">
                  This sample updates as you add or remove classes.
                </div>
                <div className="mt-3 inline-flex items-center rounded-md border px-3 py-1 text-xs">
                  Sample button
                </div>
              </div>
            </div>
          </div>

          {filteredCategories.length === 0 && categories.length === 0 && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No CSS categories available yet. Add some in the CSS Classes tab.
            </div>
          )}

          {filteredCategories.length === 0 && categories.length > 0 && normalizedSearch && (
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              No classes match &quot;{searchQuery}&quot;.
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <div className="overflow-x-auto">
              <TabsList className="w-max">
                {filteredCategories.map(category => (
                  <TabsTrigger key={category.name} value={category.name}>
                    {category.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </div>

            {filteredCategories.map(category => (
              <TabsContent key={category.name} value={category.name}>
                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {category.classes.map(cls => (
                      <button
                        key={cls}
                        onClick={() => toggleClass(cls)}
                        className={`
                          px-3 py-2 text-sm rounded border text-left transition-colors
                          ${selectedClasses.includes(cls)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card hover:bg-accent hover:text-accent-foreground'
                          }
                        `}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}

            <TabsContent value="custom">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter custom class name..."
                    value={customClass}
                    onChange={(e) => setCustomClass(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addCustomClass()}
                  />
                  <Button onClick={addCustomClass}>
                    <Plus className="mr-2" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Add custom CSS classes that aren't in the predefined list.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <FloppyDisk className="mr-2" />
            Apply Classes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
