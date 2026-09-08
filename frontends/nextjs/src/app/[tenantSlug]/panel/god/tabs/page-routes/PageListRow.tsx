'use client'

import { TableCell, TableRow, Chip } from '@/m3'
import type { PageRoute } from '@/hooks/usePageRoutes'
import { pageLevelLabel } from '@/lib/tenant/page-levels'
import { levelColor, visibilityLabel } from './page-list-levels'
import { PageListRowActions } from './PageListRowActions'
import s from './PageList.module.scss'

export interface PageListRowProps {
  page: PageRoute
  onEdit: (page: PageRoute) => void
  onDelete: (page: PageRoute) => void
  onPreview: (page: PageRoute) => void
}

export function PageListRow({
  page,
  onEdit,
  onDelete,
  onPreview,
}: PageListRowProps) {
  return (
    <TableRow hover>
      <TableCell>
        <code className={s.path}>{page.path}</code>
      </TableCell>
      <TableCell>{page.title}</TableCell>
      <TableCell>
        <Chip
          label={pageLevelLabel(page.level)}
          color={levelColor(page.level)}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={visibilityLabel(page)}
          color={visibilityLabel(page) === 'Sign-in' ? 'warning' : 'success'}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={page.isPublished ? 'Live' : 'Draft'}
          color={page.isPublished ? 'success' : 'default'}
          size="small"
        />
      </TableCell>
      <TableCell align="right">
        <PageListRowActions
          page={page}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
        />
      </TableCell>
    </TableRow>
  )
}
