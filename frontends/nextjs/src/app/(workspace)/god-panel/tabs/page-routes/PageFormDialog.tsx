'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@/m3'
import type { PageRoute, PageRouteInput } from '@/hooks/usePageRoutes'
import { PageFormFields } from './PageFormFields'

interface PageFormDialogProps {
  open: boolean
  page: PageRoute | null
  tenant: string
  onClose: () => void
  onSubmit: (data: PageRouteInput, id?: string) => Promise<void>
}

const DEFAULTS: PageRouteInput = {
  path: '/',
  title: '',
  description: null,
  level: 0,
  requiresAuth: false,
  requiredRole: null,
  componentTree: '{\n  "type": "Box",\n  "props": {},\n  "children": []\n}',
  isPublished: true,
  sortOrder: 0,
  tenantId: null,
  packageId: null,
}

export function PageFormDialog({
  open,
  page,
  tenant,
  onClose,
  onSubmit,
}: PageFormDialogProps) {
  const [form, setForm] = useState<Partial<PageRouteInput>>(
    () => page ?? { ...DEFAULTS, tenantId: tenant }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = <K extends keyof PageRouteInput>(
    field: K,
    value: PageRouteInput[K]
  ) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      const data: PageRouteInput = {
        ...DEFAULTS,
        ...form,
        tenantId: tenant,
      }
      await onSubmit(data, page?.id)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const pathValid = (form.path?.length ?? 0) > 0
  const titleValid = (form.title?.length ?? 0) > 0

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{page !== null ? 'Edit Page' : 'New Page'}</DialogTitle>
      <DialogContent dividers>
        <PageFormFields form={form} onChange={handleChange} />
        {error !== null && (
          <Alert severity="error" style={{ marginTop: 12 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            void handleSubmit()
          }}
          disabled={saving || !pathValid || !titleValid}
        >
          {saving ? 'Saving…' : page !== null ? 'Save Changes' : 'Create Page'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
