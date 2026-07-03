'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  Typography,
} from '@/m3'
import type { PageRoute } from '@/hooks/usePageRoutes'
import s from './PageList.module.scss'

interface PageListProps {
  pages: PageRoute[]
  onEdit: (page: PageRoute) => void
  onDelete: (page: PageRoute) => void
  onPreview: (page: PageRoute) => void
}

const LEVEL_LABELS: Record<number, string> = {
  1: 'Public',
  2: 'User',
  3: 'Admin',
  4: 'God',
  5: 'SuperGod',
}

const LEVEL_COLORS = [
  'default',
  'default',
  'info',
  'warning',
  'error',
  'secondary',
] as const

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
            <TableRow key={page.id} hover>
              <TableCell>
                <code className={s.path}>{page.path}</code>
              </TableCell>
              <TableCell>{page.title}</TableCell>
              <TableCell>
                <Chip
                  label={LEVEL_LABELS[page.level] ?? `L${page.level}`}
                  color={LEVEL_COLORS[page.level] ?? 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={page.requiresAuth ? 'Auth' : 'Public'}
                  color={page.requiresAuth ? 'warning' : 'success'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={page.isActive ? 'Live' : 'Draft'}
                  color={page.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">
                <div className={s.actions}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => { onPreview(page) }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => { onEdit(page) }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    color="error"
                    onClick={() => { onDelete(page) }}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
