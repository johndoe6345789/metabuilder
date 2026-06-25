import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ModelSchema, SchemaConfig } from '@/lib/schema-types'
import { getRecordsKey, getFieldLabel, sortRecords, filterRecords, findModel } from '@/lib/schema-utils'
import { RecordForm } from './RecordForm'
import { Plus, Pencil, Trash, MagnifyingGlass, ArrowUp, ArrowDown } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface RelationCellValueProps {
  value: string
  relatedModel: string
  currentApp: string
  schema: SchemaConfig
}

function RelationCellValue({ value, relatedModel, currentApp, schema }: RelationCellValueProps) {
  const relatedRecordsKey = getRecordsKey(currentApp, relatedModel)
  const [relatedRecords] = useKV<any[]>(relatedRecordsKey, [])
  const relatedRecord = relatedRecords?.find((r: any) => r.id === value)
  
  if (!relatedRecord) return <span className="font-mono text-sm text-muted-foreground">{value}</span>
  
  const relatedModelDef = findModel(schema, currentApp, relatedModel)
  const displayField = relatedModelDef?.fields.find(f => f.name === 'name' || f.name === 'title')?.name || 'id'
  
  return <Badge variant="outline" className="font-normal">{relatedRecord[displayField]}</Badge>
}

interface ModelListViewProps {
  model: ModelSchema
  schema: SchemaConfig
  currentApp: string
}

export function ModelListView({ model, schema, currentApp }: ModelListViewProps) {
  const [records, setRecords] = useKV<any[]>(getRecordsKey(currentApp, model.name), [])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<string | null>(model.ordering?.[0]?.replace('-', '') || null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    model.ordering?.[0]?.startsWith('-') ? 'desc' : 'asc'
  )
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any | null>(null)

  const displayFields = model.listDisplay || model.fields.filter(f => f.listDisplay !== false).slice(0, 5).map(f => f.name)
  const searchFields = model.searchFields || model.fields.filter(f => f.searchable).map(f => f.name)
  const filterFields = model.listFilter || model.fields.filter(f => f.type === 'select' || f.type === 'boolean').map(f => f.name)

  const filteredAndSortedRecords = useMemo(() => {
    if (!records) return []
    
    let result = filterRecords(records, searchTerm, searchFields, filters)
    
    if (sortField) {
      result = sortRecords(result, sortField, sortDirection)
    }
    
    return result
  }, [records, searchTerm, searchFields, filters, sortField, sortDirection])

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(fieldName)
      setSortDirection('asc')
    }
  }

  const handleCreate = () => {
    setEditingRecord(null)
    setFormOpen(true)
  }

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setFormOpen(true)
  }

  const handleDelete = (recordId: string) => {
    setRecords((current) => (current || []).filter((r) => r.id !== recordId))
    toast.success('Record deleted')
  }

  const handleSave = (record: any) => {
    if (editingRecord) {
      setRecords((current) => (current || []).map((r) => (r.id === record.id ? record : r)))
      toast.success('Record updated')
    } else {
      setRecords((current) => [...(current || []), record])
      toast.success('Record created')
    }
  }

  const renderCellValue = (record: any, fieldName: string) => {
    const field = model.fields.find(f => f.name === fieldName)
    if (!field) return null

    const value = record[fieldName]

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>
    }

    switch (field.type) {
      case 'boolean':
        return value ? (
          <Badge className="bg-accent text-accent-foreground">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        )
      
      case 'date':
      case 'datetime':
        return new Date(value).toLocaleString()
      
      case 'select':
        const choice = field.choices?.find(c => c.value === value)
        return <Badge variant="secondary">{choice?.label || value}</Badge>
      
      case 'relation':
        return (
          <RelationCellValue
            value={value}
            relatedModel={field.relatedModel || ''}
            currentApp={currentApp}
            schema={schema}
          />
        )
      
      case 'json':
        return <code className="text-xs bg-muted px-2 py-1 rounded">{JSON.stringify(value)}</code>
      
      case 'number':
        return <span className="font-mono">{value}</span>
      
      case 'text':
        return <span className="truncate max-w-xs block">{String(value).substring(0, 100)}</span>
      
      default:
        return String(value)
    }
  }

  if (!records) return null

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={`Search ${searchFields.join(', ')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {filterFields.map(fieldName => {
            const field = model.fields.find(f => f.name === fieldName)
            if (!field) return null

            if (field.type === 'select') {
              return (
                <Select
                  key={fieldName}
                  value={filters[fieldName] || '__all__'}
                  onValueChange={(value) => setFilters({ ...filters, [fieldName]: value === '__all__' ? null : value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={getFieldLabel(field)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {field.choices?.map(choice => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            }

            if (field.type === 'boolean') {
              return (
                <Select
                  key={fieldName}
                  value={filters[fieldName] === true ? 'true' : filters[fieldName] === false ? 'false' : '__all__'}
                  onValueChange={(value) => setFilters({ ...filters, [fieldName]: value === 'true' ? true : value === 'false' ? false : null })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={getFieldLabel(field)} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )
            }

            return null
          })}
        </div>
        
        <Button onClick={handleCreate} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2" weight="bold" />
          Create New
        </Button>
      </div>

      {filteredAndSortedRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground mb-4">
            {records.length === 0 ? 'No records yet' : 'No records match your filters'}
          </p>
          {records.length === 0 && (
            <Button onClick={handleCreate} variant="outline">
              <Plus className="mr-2" />
              Create First Record
            </Button>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {displayFields.map(fieldName => {
                  const field = model.fields.find(f => f.name === fieldName)
                  if (!field) return null
                  
                  const isSortable = field.sortable !== false
                  
                  return (
                    <TableHead
                      key={fieldName}
                      className={isSortable ? 'cursor-pointer select-none hover:bg-muted' : ''}
                      onClick={() => isSortable && handleSort(fieldName)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="uppercase text-xs font-semibold tracking-wider">
                          {getFieldLabel(field)}
                        </span>
                        {isSortable && sortField === fieldName && (
                          sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                        )}
                      </div>
                    </TableHead>
                  )
                })}
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRecords.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.15 }}
                  className="hover:bg-muted/30 border-b"
                >
                  {displayFields.map(fieldName => (
                    <TableCell key={fieldName} className="py-3">
                      {renderCellValue(record, fieldName)}
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(record)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(record.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <RecordForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        model={model}
        schema={schema}
        currentApp={currentApp}
        record={editingRecord}
        onSave={handleSave}
      />
    </div>
  )
}
