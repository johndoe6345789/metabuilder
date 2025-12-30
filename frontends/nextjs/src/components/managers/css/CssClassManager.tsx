import { FloppyDisk, Pencil, Plus, Trash, X } from '@/fakemui/icons'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Card } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Badge } from '@/components/ui'
import { ScrollArea } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { CssCategory, Database } from '@/lib/database'

// eslint-disable-next-line no-useless-escape
const CLASS_TOKEN_PATTERN = /^[A-Za-z0-9:_/.\[\]()%#!,=+-]+$/
const uniqueClasses = (classes: string[]) => Array.from(new Set(classes))

export function CssClassManager() {
  const [categories, setCategories] = useState<CssCategory[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CssCategory | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [classes, setClasses] = useState<string[]>([])
  const [newClass, setNewClass] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [classSearchQuery, setClassSearchQuery] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  const normalizedSearch = searchQuery.trim().toLowerCase()
  const filteredCategories = normalizedSearch
    ? categories.filter(
        category =>
          category.name.toLowerCase().includes(normalizedSearch) ||
          category.classes.some(cls => cls.toLowerCase().includes(normalizedSearch))
      )
    : categories
  const totalClassCount = categories.reduce((total, category) => total + category.classes.length, 0)

  const newClassTokens = newClass.trim().split(/\s+/).filter(Boolean)
  const uniqueNewClassTokens = Array.from(new Set(newClassTokens))
  const invalidNewClassTokens = uniqueNewClassTokens.filter(
    token => !CLASS_TOKEN_PATTERN.test(token)
  )
  const duplicateNewClassTokens = uniqueNewClassTokens.filter(token => classes.includes(token))
  const canAddClass =
    uniqueNewClassTokens.length > 0 &&
    invalidNewClassTokens.length === 0 &&
    uniqueNewClassTokens.some(token => !classes.includes(token))

  const normalizedClassSearch = classSearchQuery.trim().toLowerCase()
  const filteredEditorClasses = normalizedClassSearch
    ? classes.filter(cls => cls.toLowerCase().includes(normalizedClassSearch))
    : classes

  const loadCategories = async () => {
    const cats = await Database.getCssClasses()
    const normalized = cats.map(category => ({
      ...category,
      classes: uniqueClasses(category.classes),
    }))
    const sorted = normalized.slice().sort((a, b) => a.name.localeCompare(b.name))
    setCategories(sorted)
  }

  const startEdit = (category?: CssCategory) => {
    if (category) {
      setEditingCategory(category)
      setCategoryName(category.name)
      setClasses(uniqueClasses(category.classes))
    } else {
      setEditingCategory(null)
      setCategoryName('')
      setClasses([])
    }
    setNewClass('')
    setClassSearchQuery('')
    setIsEditing(true)
  }

  const addClass = () => {
    if (uniqueNewClassTokens.length === 0) {
      return
    }

    if (invalidNewClassTokens.length > 0) {
      toast.error(`Invalid class name: ${invalidNewClassTokens.join(', ')}`)
      return
    }

    const newTokens = uniqueNewClassTokens.filter(token => !classes.includes(token))
    if (newTokens.length === 0) {
      toast.info('Those classes already exist in this category')
      return
    }

    setClasses(current => uniqueClasses([...current, ...newTokens]))
    setNewClass('')
  }

  const removeClass = (cssClass: string) => {
    setClasses(current => current.filter(cls => cls !== cssClass))
  }

  const handleSave = async () => {
    const trimmedName = categoryName.trim()
    const normalizedClasses = uniqueClasses(classes)
    if (!trimmedName || normalizedClasses.length === 0) {
      toast.error('Please provide a category name and at least one class')
      return
    }

    const nameConflict = categories.some(
      category =>
        category.name.toLowerCase() === trimmedName.toLowerCase() &&
        category.name !== editingCategory?.name
    )
    if (nameConflict) {
      toast.error('A category with this name already exists')
      return
    }

    const newCategory: CssCategory = {
      name: trimmedName,
      classes: normalizedClasses,
    }

    try {
      if (editingCategory) {
        await Database.updateCssCategory(editingCategory.name, newCategory)
        toast.success('Category updated successfully')
      } else {
        await Database.addCssCategory(newCategory)
        toast.success('Category created successfully')
      }

      setIsEditing(false)
      loadCategories()
    } catch (error) {
      toast.error('Failed to save category')
    }
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">CSS Class Library</h2>
          <p className="text-sm text-muted-foreground">
            Manage CSS classes available in the builder
          </p>
          <p className="text-xs text-muted-foreground">
            {categories.length} categories • {totalClassCount} classes
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search categories or classes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="sm:w-64"
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
          <Button onClick={() => startEdit()}>
            <Plus className="mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(category => (
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
                {category.classes.map(cls => (
                  <Badge key={cls} variant="outline" className="text-xs font-mono">
                    {cls}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
            <div className="text-xs text-muted-foreground">{category.classes.length} classes</div>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && categories.length > 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No categories match your search.</p>
        </Card>
      )}

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
                onChange={e => setCategoryName(e.target.value)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>CSS Classes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter class name"
                  value={newClass}
                  onChange={e => setNewClass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canAddClass && addClass()}
                  className={`font-mono ${invalidNewClassTokens.length > 0 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                />
                <Button onClick={addClass} type="button" disabled={!canAddClass}>
                  <Plus size={16} />
                </Button>
              </div>
              {invalidNewClassTokens.length > 0 && (
                <p className="text-xs text-destructive">
                  Invalid class names: {invalidNewClassTokens.join(', ')}
                </p>
              )}
              {duplicateNewClassTokens.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Already in category: {duplicateNewClassTokens.join(', ')}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                You can add multiple classes separated by spaces.
              </p>
            </div>

            {classes.length > 0 && (
              <div className="space-y-2">
                <Label>Filter Classes</Label>
                <Input
                  placeholder="Filter classes..."
                  value={classSearchQuery}
                  onChange={e => setClassSearchQuery(e.target.value)}
                  className="font-mono"
                />
              </div>
            )}

            {classes.length > 0 && (
              <ScrollArea className="h-[200px] border rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {filteredEditorClasses.map(cls => (
                    <Badge key={cls} variant="secondary" className="gap-2 font-mono">
                      {cls}
                      <button onClick={() => removeClass(cls)} className="hover:text-destructive">
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            )}

            {classes.length > 0 && filteredEditorClasses.length === 0 && (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                No classes match this filter.
              </div>
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
