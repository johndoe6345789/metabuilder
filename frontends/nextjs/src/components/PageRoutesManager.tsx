import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Pencil, Trash, Eye, LockKey } from '@phosphor-icons/react'
import { Database } from '@/lib/database'
import { toast } from 'sonner'
import type { PageConfig, UserRole, AppLevel } from '@/lib/level-types'
import { Switch } from '@/components/ui/switch'

export function PageRoutesManager() {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null)
  const [formData, setFormData] = useState<Partial<PageConfig>>({
    path: '/',
    title: '',
    level: 1,
    requiresAuth: false,
    componentTree: [],
  })

  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    const loadedPages = await Database.getPages()
    setPages(loadedPages)
  }

  const handleOpenDialog = (page?: PageConfig) => {
    if (page) {
      setEditingPage(page)
      setFormData(page)
    } else {
      setEditingPage(null)
      setFormData({
        path: '/',
        title: '',
        level: 1,
        requiresAuth: false,
        componentTree: [],
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPage(null)
    setFormData({
      path: '/',
      title: '',
      level: 1,
      requiresAuth: false,
      componentTree: [],
    })
  }

  const handleSavePage = async () => {
    if (!formData.path || !formData.title) {
      toast.error('Path and title are required')
      return
    }

    if (editingPage) {
      await Database.updatePage(editingPage.id, formData)
      toast.success('Page updated successfully')
    } else {
      const newPage: PageConfig = {
        id: `page_${Date.now()}`,
        path: formData.path!,
        title: formData.title!,
        level: formData.level || 1,
        componentTree: formData.componentTree || [],
        requiresAuth: formData.requiresAuth || false,
        requiredRole: formData.requiredRole,
      }
      await Database.addPage(newPage)
      toast.success('Page created successfully')
    }

    handleCloseDialog()
    loadPages()
  }

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      await Database.deletePage(pageId)
      toast.success('Page deleted')
      loadPages()
    }
  }

  const getLevelBadgeColor = (level: AppLevel) => {
    switch (level) {
      case 1: return 'bg-blue-500'
      case 2: return 'bg-green-500'
      case 3: return 'bg-orange-500'
      case 4: return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Page Routes</h2>
          <p className="text-muted-foreground">Configure page routes and URLs for your application</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2" />
              New Page Route
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page Route' : 'Create New Page Route'}</DialogTitle>
              <DialogDescription>
                Configure the route path, access level, and authentication requirements
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="path">Route Path *</Label>
                  <Input
                    id="path"
                    placeholder="/home"
                    value={formData.path || ''}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title *</Label>
                  <Input
                    id="title"
                    placeholder="Home Page"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">Application Level</Label>
                  <Select
                    value={String(formData.level)}
                    onValueChange={(value) => setFormData({ ...formData, level: Number(value) as AppLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Level 1 - Public</SelectItem>
                      <SelectItem value="2">Level 2 - User Area</SelectItem>
                      <SelectItem value="3">Level 3 - Admin Panel</SelectItem>
                      <SelectItem value="4">Level 4 - God Panel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredRole">Required Role (if auth)</Label>
                  <Select
                    value={formData.requiredRole || 'public'}
                    onValueChange={(value) => setFormData({ ...formData, requiredRole: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="god">God</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requiresAuth"
                  checked={formData.requiresAuth}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresAuth: checked })}
                />
                <Label htmlFor="requiresAuth" className="cursor-pointer">Requires Authentication</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleSavePage}>
                {editingPage ? 'Update Page' : 'Create Page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Routes</CardTitle>
          <CardDescription>All page routes in your application</CardDescription>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No pages configured yet. Create your first page route!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Path</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Auth</TableHead>
                  <TableHead>Required Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-mono text-sm">{page.path}</TableCell>
                    <TableCell>{page.title}</TableCell>
                    <TableCell>
                      <Badge className={getLevelBadgeColor(page.level)}>
                        Level {page.level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {page.requiresAuth ? (
                        <LockKey className="text-orange-500" weight="fill" />
                      ) : (
                        <Eye className="text-green-500" weight="fill" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {page.requiredRole || 'public'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(page)}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePage(page.id)}
                        >
                          <Trash />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
