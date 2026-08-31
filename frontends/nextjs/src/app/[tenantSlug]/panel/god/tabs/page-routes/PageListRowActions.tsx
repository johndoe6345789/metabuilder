'use client'

import { Button } from '@/m3'
import type { PageRoute } from '@/hooks/usePageRoutes'
import s from './PageList.module.scss'

export interface PageListRowActionsProps {
  page: PageRoute
  onEdit: (page: PageRoute) => void
  onDelete: (page: PageRoute) => void
  onPreview: (page: PageRoute) => void
}

export function PageListRowActions({
  page,
  onEdit,
  onDelete,
  onPreview,
}: PageListRowActionsProps) {
  return (
    <div className={s.actions}>
      <Button
        size="small"
        variant="text"
        onClick={() => {
          onPreview(page)
        }}
      >
        Preview
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          onEdit(page)
        }}
      >
        Edit
      </Button>
      <Button
        size="small"
        variant="text"
        color="error"
        onClick={() => {
          onDelete(page)
        }}
      >
        Delete
      </Button>
    </div>
  )
}
