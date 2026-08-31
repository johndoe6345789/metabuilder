import { useState } from 'react'
import type { PageRoute, PageRouteInput } from '@/hooks/usePageRoutes'

const DEFAULTS: PageRouteInput = {
  path: '/',
  title: '',
  description: null,
  level: 0,
  requiresAuth: false,
  requiredRole: null,
  pageTreeId: null,
  isPublished: true,
  sortOrder: 0,
  tenantId: null,
  packageId: null,
}

export interface UsePageFormArgs {
  page: PageRoute | null
  tenant: string
  onSubmit: (data: PageRouteInput, id?: string) => Promise<void>
  onClose: () => void
}

/** Draft state, field edits, and the validate-then-submit flow for the
 *  page create/edit dialog, kept out of the dialog so it only owns layout. */
export function usePageForm({
  page,
  tenant,
  onSubmit,
  onClose,
}: UsePageFormArgs) {
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
      const data: PageRouteInput = { ...DEFAULTS, ...form, tenantId: tenant }
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

  return {
    form,
    saving,
    error,
    handleChange,
    handleSubmit,
    pathValid,
    titleValid,
  }
}
