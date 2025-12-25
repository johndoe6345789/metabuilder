import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Database, CssCategory } from '@/lib/database'
import { Plus, X, Pencil, Trash, FloppyDisk } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function CssClassManager() {
  const [categories, setCategories] = useState<CssCategory[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CssCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [classes, setClasses] = useState<string[]>([])
  const [newClass, setNewClass] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    const cats = await Database.getCssClasses()
    setCategories(cats)
  }

  const startEdit = (category?: CssCategory) => {
    if (category) {
      setEditingCategory(category)
      setCategoryName(category.name)
      setClasses([...category.classes])
    } else {
      setEditingCategory(null)
      setCategoryName('')
      setClasses([])
    }
    setIsEditing(true)
  }

  const addClass = () => {
    if (newClass.trim()) {
      setClasses(current => [...current, newClass.trim()])
      setNewClass('')
    }
  }

  const removeClass = (index: number) => {
    setClasses(current => current.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!categoryName || classes.length === 0) {
      toast.error('Please provide a category name and at least one class')
      return
    }

    const newCategory: CssCategory = {
      name: categoryName,
      classes,
    }

    if (editingCategory) {
      await Database.updateCssCategory(categoryName, classes)
      toast.success('Category updated successfully')
    } else {
      await Database.addCssCategory(newCategory)
      toast.success('Category created successfully')
    }

    setIsEditing(false)
    loadCategories()
  }

  const handleDelete = async (categoryName: string) => {
    if (confirm('Are you sure you want to delete this CSS category?')) {
      await Database.deleteCssCategory(categoryName)
      toast.success('Category deleted')
      loadCategories()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CSS Class Library</h2>
          <p className="text-sm text-muted-foreground">Manage CSS classes available in the builder</p>
        </div>
        <Button onClick={() => startEdit()}>
          <Plus className="mr-2" />
          Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => (
          <Card key={category.name} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEdit(category)}>
                  <Pencil size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleDelete(category.name)}>
                  <Trash size={16} />
                </Button>
              </div>
            </div>
            <Separator />
            <ScrollArea className="h-[120px]">
              <div className="flex flex-wrap gap-1">
                {category.classes.map((cls, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-mono">
                    {cls}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <div className="text-xs text-muted-foreground">
              {category.classes.length} classes
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No CSS categories yet. Add one to get started.</p>
        </Card>
      )}

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit' : 'Create'} CSS Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category Name</Label>
              <Input
                placeholder="e.g., Layout"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={!!editingCategory}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>CSS Classes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter class name"
                  value={newClass}
                  onChange={(e) => setNewClass(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addClass()}
                  className="font-mono"
                />
                <Button onClick={addClass} type="button">
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {classes.length > 0 && (
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls, i) => (
                    <Badge key={i} variant="secondary" className="gap-2 font-mono">
                      {cls}
                      <button
                        onClick={() => removeClass(i)}
                        className="hover:text-destructive"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <FloppyDisk className="mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
