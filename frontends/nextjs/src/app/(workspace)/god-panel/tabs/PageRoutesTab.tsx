'use client'

import { useState } from 'react'
import { Typography, Button, TextField, Chip, Alert } from '@/m3'
import { usePageRoutes } from '@/hooks/usePageRoutes'
import type { PageRoute, PageRouteInput } from '@/hooks/usePageRoutes'
import { BASE_PATH } from '@/lib/app-config'
import { PageList } from './page-routes/PageList'
import { PageFormDialog } from './page-routes/PageFormDialog'
import { DeletePageDialog } from './page-routes/DeletePageDialog'
import s from './PageRoutesTab.module.scss'

const SYSTEM_TENANT = 'system'

export function PageRoutesTab() {
  const [tenant, setTenant] = useState(SYSTEM_TENANT)
  const [tenantInput, setTenantInput] = useState(SYSTEM_TENANT)
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
    const path = page.path.startsWith('/') ? page.path : `/${page.path}`
    const previewUrl = page.path.startsWith('http')
      ? page.path
      : `${window.location.origin}${BASE_PATH}/${tenant}${path}`
    window.open(previewUrl, '_blank', 'noopener')
  }

  const applyTenant = () => {
    const trimmed = tenantInput.trim()
    setTenant(trimmed.length > 0 ? trimmed : SYSTEM_TENANT)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    reload()
  }

  const handleDeleteClose = () => {
    setDeletePage(null)
  }

  const live = pages.filter(p => p.isPublished).length
  const draft = pages.length - live

  return (
    <div className={s.root}>
      <div className={s.header}>
        <div>
          <Typography variant="h6" gutterBottom>
            Page Routes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage tenant pages. Each page maps a URL path to a
            component tree rendered at runtime.
          </Typography>
        </div>
        <Button variant="contained" onClick={openCreate}>
          + New Page
        </Button>
      </div>

      <div className={s.tenantRow}>
        <TextField
          label="Tenant"
          value={tenantInput}
          onChange={e => {
            setTenantInput(e.target.value)
          }}
          size="small"
          style={{ width: 200 }}
          onKeyDown={e => {
            if (e.key === 'Enter') applyTenant()
          }}
        />
        <Button variant="outlined" size="small" onClick={applyTenant}>
          Load
        </Button>
        <Chip label={`/${tenant}/`} size="small" variant="outlined" />
        {pages.length > 0 && (
          <>
            <Chip label={`${live} live`} size="small" color="success" />
            {draft > 0 && <Chip label={`${draft} draft`} size="small" />}
          </>
        )}
      </div>

      {error !== null && (
        <Alert severity="warning" style={{ marginBottom: 16 }}>
          DBAL offline — {error}. Connect daemon to manage pages.
        </Alert>
      )}

      {loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading pages…
        </Typography>
      ) : (
        <PageList
          pages={pages}
          onEdit={openEdit}
          onDelete={p => {
            setDeletePage(p)
          }}
          onPreview={openPreview}
        />
      )}

      <PageFormDialog
        key={editPage?.id ?? 'new'}
        open={formOpen}
        page={editPage}
        tenant={tenant}
        onClose={handleFormClose}
        onSubmit={handleCreate}
      />

      <DeletePageDialog
        open={deletePage !== null}
        page={deletePage}
        onClose={handleDeleteClose}
        onConfirm={remove}
      />
    </div>
  )
}
