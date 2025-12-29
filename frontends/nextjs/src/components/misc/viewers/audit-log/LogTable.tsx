import {
  ArrowDown,
  ArrowUp,
  ShieldCheck,
  User as UserIcon,
  WarningCircle,
} from '@phosphor-icons/react'

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import type { AuditLog, OperationType, ResourceType } from '@/lib/security/secure-db/types'

interface LogTableProps {
  logs: AuditLog[]
  sortField?: keyof AuditLog | null
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (field: keyof AuditLog) => void
}

const OPERATION_COLORS: Record<OperationType, string> = {
  CREATE: 'bg-green-100 text-green-800',
  READ: 'bg-blue-100 text-blue-800',
  UPDATE: 'bg-yellow-100 text-yellow-800',
  DELETE: 'bg-red-100 text-red-800',
}

const RESOURCE_ICONS: Partial<Record<ResourceType, JSX.Element>> = {
  user: <UserIcon className="h-4 w-4" weight="bold" />,
  credential: <ShieldCheck className="h-4 w-4" weight="bold" />,
}

export function LogTable({ logs, sortField, sortDirection = 'asc', onSortChange }: LogTableProps) {
  const handleSort = (field: keyof AuditLog) => {
    onSortChange?.(field)
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b bg-muted/40 py-3">
        <CardTitle className="text-base font-semibold">Audit Log</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[480px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <SortableHeader
                  field="timestamp"
                  label="Timestamp"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
                <TableHead>User</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No audit events to display
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.id} className="hover:bg-muted/20">
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.username}</TableCell>
                    <TableCell>
                      <Badge className={OPERATION_COLORS[log.operation]}>{log.operation}</Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      {RESOURCE_ICONS[log.resource] || (
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="capitalize">{log.resource}</span>
                    </TableCell>
                    <TableCell>
                      {log.success ? (
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          <ShieldCheck className="mr-1 h-4 w-4" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <WarningCircle className="h-4 w-4" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.errorMessage || '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

interface SortableHeaderProps {
  field: keyof AuditLog
  label: string
  sortField?: keyof AuditLog | null
  sortDirection?: 'asc' | 'desc'
  onSort?: (field: keyof AuditLog) => void
}

function SortableHeader({
  field,
  label,
  sortField,
  sortDirection = 'asc',
  onSort,
}: SortableHeaderProps) {
  const isActive = sortField === field
  const Icon = sortDirection === 'asc' ? ArrowUp : ArrowDown

  return (
    <TableHead className="cursor-pointer select-none" onClick={() => onSort?.(field)}>
      <div className="flex items-center gap-2">
        {label}
        {isActive && <Icon className="h-3.5 w-3.5" />}
      </div>
    </TableHead>
  )
}
