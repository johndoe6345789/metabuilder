'use client'

import { Typography, Button, Alert } from '@/m3'
import { PageList } from './page-routes/PageList'
import { PageFormDialog } from './page-routes/PageFormDialog'
import { DeletePageDialog } from './page-routes/DeletePageDialog'
import { usePageRoutesTab } from './use-page-routes-tab'
import { PageRoutesTenantRow } from './PageRoutesTenantRow'
import s from './PageRoutesTab.module.scss'

export function PageRoutesTab() {
  const t = usePageRoutesTab()

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
        <Button variant="contained" onClick={t.openCreate}>
          + New Page
        </Button>
      </div>

      <PageRoutesTenantRow
        tenant={t.tenant}
        tenantInput={t.tenantInput}
        setTenantInput={t.setTenantInput}
        applyTenant={t.applyTenant}
        canPickOtherTenant={t.canPickOtherTenant}
        pageCount={t.pages.length}
        live={t.live}
        draft={t.draft}
      />

      {t.error !== null && (
        <Alert severity="warning" style={{ marginBottom: 16 }}>
          DBAL offline — {t.error}. Connect daemon to manage pages.
        </Alert>
      )}

      {t.loading ? (
        <Typography variant="body2" color="text.secondary">
          Loading pages…
        </Typography>
      ) : (
        <PageList
          pages={t.pages}
          onEdit={t.openEdit}
          onDelete={t.setDeletePage}
          onPreview={t.openPreview}
        />
      )}

      <PageFormDialog
        key={t.editPage?.id ?? 'new'}
        open={t.formOpen}
        page={t.editPage}
        tenant={t.tenant}
        onClose={t.handleFormClose}
        onSubmit={t.handleCreate}
      />

      <DeletePageDialog
        open={t.deletePage !== null}
        page={t.deletePage}
        onClose={t.handleDeleteClose}
        onConfirm={t.remove}
      />
    </div>
  )
}
