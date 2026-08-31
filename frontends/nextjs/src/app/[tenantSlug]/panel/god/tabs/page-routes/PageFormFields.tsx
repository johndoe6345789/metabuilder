'use client'

import type { PageRouteInput } from '@/hooks/usePageRoutes'
import type { PageFormOnChange } from './page-form-field-types'
import { PageFormBasicFields } from './PageFormBasicFields'
import { PageFormAccessLevel } from './PageFormAccessLevel'
import { PageFormVisibility } from './PageFormVisibility'
import s from './PageFormFields.module.scss'

interface PageFormFieldsProps {
  form: Partial<PageRouteInput>
  onChange: PageFormOnChange
}

export function PageFormFields({ form, onChange }: PageFormFieldsProps) {
  // A page's layout is edited in the God Panel builder and stored as rows;
  // there is no JSON for anyone to paste here any more.
  return (
    <div className={s.fields}>
      <PageFormBasicFields form={form} onChange={onChange} />
      <PageFormAccessLevel level={form.level} onChange={onChange} />
      <PageFormVisibility
        requiresAuth={form.requiresAuth}
        isPublished={form.isPublished}
        onChange={onChange}
      />
    </div>
  )
}
