'use client'

import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@/m3'
import type { PageRoute } from '@/hooks/usePageRoutes'
import { PageListRow } from './PageListRow'
import s from './PageList.module.scss'

interface PageListProps {
  pages: PageRoute[]
  onEdit: (page: PageRoute) => void
  onDelete: (page: PageRoute) => void
  onPreview: (page: PageRoute) => void
}

export function PageList({
  pages,
  onEdit,
  onDelete,
  onPreview,
}: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className={s.empty}>
        <Typography variant="body2" color="text.secondary">
          No pages yet. Create your first page to get started.
        </Typography>
      </div>
    )
  }

  return (
    <div className={s.tableWrap}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Path</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Level</TableCell>
            <TableCell>Auth</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pages.map(page => (
            <PageListRow
              key={page.id}
              page={page}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreview={onPreview}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
