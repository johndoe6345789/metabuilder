import { useState } from 'react'
import { usePageRoutes } from '@/hooks/usePageRoutes'
import type { PageRoute, PageRouteInput } from '@/hooks/usePageRoutes'
import { previewUrl, publishCounts } from './page-routes-logic'
import { usePageRoutesTenant } from './use-page-routes-tenant'

/** All of PageRoutesTab's state and handlers, kept out of the component
 *  so it only owns layout. */
export function usePageRoutesTab() {
  const {
    tenant, tenantInput, setTenantInput, applyTenant, canPickOtherTenant,
  } = usePageRoutesTenant()
  const [editPage, setEditPage] = useState<PageRoute | null>(null)
  const [deletePage, setDeletePage] = useState<PageRoute | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const { pages, loading, error, reload, create, update, remove } =
    usePageRoutes(tenant)

  const handleCreate = async (data: PageRouteInput, id?: string) => {
    if (id !== undefined) {
      await update(id, data)
    } else {
      await create(data)
    }
  }

  const openCreate = () => {
    setEditPage(null)
    setFormOpen(true)
  }

  const openEdit = (page: PageRoute) => {
    setEditPage(page)
    setFormOpen(true)
  }

  const openPreview = (page: PageRoute) => {
    window.open(
      previewUrl(page, tenant, window.location.origin),
      '_blank',
      'noopener'
    )
  }

  const handleFormClose = () => {
    setFormOpen(false)
    reload()
  }

  const handleDeleteClose = () => {
    setDeletePage(null)
  }

  const { live, draft } = publishCounts(pages)

  return {
    tenant,
    tenantInput,
    setTenantInput,
    canPickOtherTenant,
    editPage,
    deletePage,
    setDeletePage,
    formOpen,
    pages,
    loading,
    error,
    live,
    draft,
    remove,
    handleCreate,
    openCreate,
    openEdit,
    openPreview,
    applyTenant,
    handleFormClose,
    handleDeleteClose,
  }
}
