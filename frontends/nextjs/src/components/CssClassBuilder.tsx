import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/lib/database'
import { Plus, X, FloppyDisk, Trash } from '@phosphor-icons/react'
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

export function CssClassBuilder({ open, onClose, initialValue = '', onSave }: CssClassBuilderProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [categories, setCategories] = useState<CssCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customClass, setCustomClass] = useState('')

  useEffect(() => {
    if (open) {
      loadCssClasses()
      setSelectedClasses(initialValue.split(' ').filter(Boolean))
    }
  }, [open, initialValue])

  const loadCssClasses = async () => {
    const classes = await Database.getCssClasses()
    setCategories(classes)
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
    if (customClass.trim()) {
      setSelectedClasses(current => [...current, customClass.trim()])
      setCustomClass('')
    }
  }

  const handleSave = () => {
    onSave(selectedClasses.join(' '))
    onClose()
  }

  const filteredCategories = categories.map(category => ({
    ...category,
    classes: category.classes.filter(cls =>
      cls.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.classes.length > 0)

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
          </div>

          {selectedClasses.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <Label className="text-xs uppercase tracking-wider mb-2 block">Selected Classes</Label>
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
              <div className="mt-3 p-2 bg-background rounded border font-mono text-sm">
                {selectedClasses.join(' ')}
              </div>
            </div>
          )}

          <Tabs defaultValue={filteredCategories[0]?.name || 'custom'} className="flex-1">
            <ScrollArea className="max-h-[50px]">
              <TabsList className="w-full">
                {filteredCategories.map(category => (
                  <TabsTrigger key={category.name} value={category.name}>
                    {category.name}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </ScrollArea>

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
