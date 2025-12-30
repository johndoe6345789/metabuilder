import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Eye, LockKey, Pencil, Trash } from '@/fakemui/icons'
import type { AppLevel, PageConfig } from '@/lib/level-types'

interface RoutesTableProps {
  pages: PageConfig[]
  onEdit: (page: PageConfig) => void
  onDelete: (pageId: string) => void
}

const getLevelBadgeColor = (level: AppLevel) => {
  switch (level) {
    case 1:
      return 'bg-blue-500'
    case 2:
      return 'bg-green-500'
    case 3:
      return 'bg-orange-500'
    case 4:
      return 'bg-sky-500'
    case 5:
      return 'bg-purple-500'
    case 6:
      return 'bg-rose-500'
    default:
      return 'bg-gray-500'
  }
}

export function RoutesTable({ pages, onEdit, onDelete }: RoutesTableProps) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No pages configured yet. Create your first page route!</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Path</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Auth</TableHead>
          <TableHead>Required Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pages.map(page => (
          <TableRow key={page.id}>
            <TableCell className="font-mono text-sm">{page.path}</TableCell>
            <TableCell>{page.title}</TableCell>
            <TableCell>
              <Badge className={getLevelBadgeColor(page.level)}>Level {page.level}</Badge>
            </TableCell>
            <TableCell>
              {page.requiresAuth ? (
                <LockKey className="text-orange-500" weight="fill" />
              ) : (
                <Eye className="text-green-500" weight="fill" />
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{page.requiredRole || 'public'}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => onEdit(page)}>
                  <Pencil />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(page.id)}>
                  <Trash />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
