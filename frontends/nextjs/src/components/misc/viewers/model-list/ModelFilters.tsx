import { MagnifyingGlass } from '@phosphor-icons/react'

import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { FieldSchema, ModelSchema } from '@/lib/schema-types'

interface ModelFiltersProps {
  model: ModelSchema
  filters: Record<string, any>
  searchTerm: string
  onSearchChange: (value: string) => void
  onFilterChange: (field: string, value: any) => void
}

function getFilterableFields(model: ModelSchema): FieldSchema[] {
  if (model.listFilter) {
    return model.fields.filter(field => model.listFilter?.includes(field.name))
  }
  return model.fields.filter(field => field.type === 'select' || field.type === 'boolean')
}

export function ModelFilters({
  model,
  filters,
  searchTerm,
  onSearchChange,
  onFilterChange,
}: ModelFiltersProps) {
  const filterFields = getFilterableFields(model)

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-2">
        <Label htmlFor="model-search">Search</Label>
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="model-search"
            placeholder={`Search ${model.labelPlural || model.name}`}
            value={searchTerm}
            onChange={event => onSearchChange(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {filterFields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filterFields.map(field => (
            <div key={field.name} className="space-y-1.5">
              <Label>{field.label || field.name}</Label>
              {field.type === 'select' ? (
                <Select
                  value={filters[field.name] ?? '__all__'}
                  onValueChange={value =>
                    onFilterChange(field.name, value === '__all__' ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.label || field.name} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    {field.choices?.map(choice => (
                      <SelectItem key={choice.value} value={choice.value}>
                        {choice.label || choice.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={
                    filters[field.name] === true
                      ? 'true'
                      : filters[field.name] === false
                        ? 'false'
                        : '__all__'
                  }
                  onValueChange={value =>
                    onFilterChange(
                      field.name,
                      value === 'true' ? true : value === 'false' ? false : null
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={field.label || field.name} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All</SelectItem>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
