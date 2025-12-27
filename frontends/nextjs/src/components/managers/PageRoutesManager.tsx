import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui'
import { Plus } from '@phosphor-icons/react'
import { Database } from '@/lib/database'
import type { PageConfig } from '@/lib/level-types'
import { toast } from 'sonner'
import { RoutesTable } from './page-routes/RoutesTable'
import { Preview } from './page-routes/Preview'
import { RouteEditor, RouteFormData } from './page-routes/RouteEditor'

const defaultFormData: RouteFormData = {
  path: '/',
  title: '',
  level: 1,
  requiresAuth: false,
  componentTree: [],
}

export function PageRoutesManager() {
  const [pages, setPages] = useState<PageConfig[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPage, setEditingPage] = useState<PageConfig | null>(null)
  const [formData, setFormData] = useState<RouteFormData>({ ...defaultFormData })

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
      setFormData({ ...defaultFormData })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPage(null)
    setFormData({ ...defaultFormData })
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
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingPage ? 'Edit Page Route' : 'Create New Page Route'}</DialogTitle>
              <DialogDescription>
                Configure the route path, access level, and authentication requirements
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 md:grid-cols-2">
              <RouteEditor
                formData={formData}
                onChange={setFormData}
                onSave={handleSavePage}
                onCancel={handleCloseDialog}
                isEdit={Boolean(editingPage)}
              />
              <Preview formData={formData} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Routes</CardTitle>
          <CardDescription>All page routes in your application</CardDescription>
        </CardHeader>
        <CardContent>
          <RoutesTable
            pages={pages}
            onEdit={handleOpenDialog}
            onDelete={handleDeletePage}
          />
        </CardContent>
      </Card>
    </div>
  )
}
