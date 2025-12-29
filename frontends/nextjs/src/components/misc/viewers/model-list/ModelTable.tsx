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
import type { FieldSchema, ModelSchema } from '@/lib/schema-types'
import { getFieldLabel } from '@/lib/schema-utils'
import { ArrowDown, ArrowUp, Pencil, Trash } from '@phosphor-icons/react'
import { ReactNode } from 'react'

interface ModelTableProps {
  model: ModelSchema
  records: any[]
  displayFields: string[]
  sortField?: string | null
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (field: string) => void
  onEdit?: (record: any) => void
  onDelete?: (id: string) => void
  onRowClick?: (record: any) => void
  renderRelationValue?: (value: string, field: FieldSchema) => ReactNode
}

export function ModelTable({
  model,
  records,
  displayFields,
  sortField,
  sortDirection = 'asc',
  onSortChange,
  onEdit,
  onDelete,
  onRowClick,
  renderRelationValue,
}: ModelTableProps) {
  const actionColumns = onEdit || onDelete ? 1 : 0

  const renderCellValue = (record: any, fieldName: string) => {
    const field = model.fields.find(item => item.name === fieldName)
    if (!field) return null

    const value = record[fieldName]

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>
    }

    if (field.type === 'relation' && typeof value === 'string' && renderRelationValue) {
      return renderRelationValue(value, field)
    }

    switch (field.type) {
      case 'boolean':
        return value ? <Badge variant="outline">Yes</Badge> : <Badge variant="secondary">No</Badge>
      case 'date':
      case 'datetime':
        return new Date(value).toLocaleString()
      case 'json':
        return <code className="text-xs">{JSON.stringify(value)}</code>
      default:
        return typeof value === 'string' && value.length > 60
          ? `${value.slice(0, 60)}…`
          : String(value)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {displayFields.map(fieldName => {
              const field = model.fields.find(item => item.name === fieldName)
              if (!field) return null
              const isSortable = field.sortable !== false
              const isActive = sortField === fieldName
              const Icon = sortDirection === 'asc' ? ArrowUp : ArrowDown

              return (
                <TableHead
                  key={fieldName}
                  className={isSortable ? 'cursor-pointer select-none' : undefined}
                  onClick={() => isSortable && onSortChange?.(fieldName)}
                >
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-xs font-semibold tracking-wide">
                      {getFieldLabel(field)}
                    </span>
                    {isSortable && isActive && <Icon className="h-3.5 w-3.5" />}
                  </div>
                </TableHead>
              )
            })}
            {(onEdit || onDelete) && <TableHead className="w-24">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={displayFields.length + actionColumns}
                className="py-10 text-center text-muted-foreground"
              >
                No records to display
              </TableCell>
            </TableRow>
          ) : (
            records.map(record => (
              <TableRow
                key={record.id}
                className="hover:bg-muted/30"
                onClick={() => onRowClick?.(record)}
              >
                {displayFields.map(fieldName => (
                  <TableCell key={fieldName} className="py-3">
                    {renderCellValue(record, fieldName)}
                  </TableCell>
                ))}
                {(onEdit || onDelete) && (
                  <TableCell>
                    <div className="flex gap-2">
                      {onEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={event => {
                            event.stopPropagation()
                            onEdit(record)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={event => {
                            event.stopPropagation()
                            onDelete(record.id)
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
