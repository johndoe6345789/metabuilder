import { FunnelSimple, MagnifyingGlass, X } from '@phosphor-icons/react'
import { useMemo } from 'react'

import { Badge, Button, Input, Label, Switch, ToggleGroup, ToggleGroupItem } from '@/components/ui'
import type { OperationType, ResourceType } from '@/lib/security/secure-db/types'

interface AuditLogFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedOperations: OperationType[]
  onOperationsChange: (operations: OperationType[]) => void
  selectedResources: ResourceType[]
  onResourcesChange: (resources: ResourceType[]) => void
  showFailuresOnly: boolean
  onShowFailuresChange: (value: boolean) => void
  availableOperations?: OperationType[]
  availableResources?: ResourceType[]
  onReset?: () => void
}

const DEFAULT_OPERATIONS: OperationType[] = ['CREATE', 'READ', 'UPDATE', 'DELETE']
const DEFAULT_RESOURCES: ResourceType[] = [
  'user',
  'workflow',
  'luaScript',
  'pageConfig',
  'modelSchema',
  'comment',
  'componentNode',
  'componentConfig',
  'cssCategory',
  'dropdownConfig',
  'tenant',
  'powerTransfer',
  'smtpConfig',
  'credential',
]

export function AuditLogFilters({
  searchTerm,
  onSearchChange,
  selectedOperations,
  onOperationsChange,
  selectedResources,
  onResourcesChange,
  showFailuresOnly,
  onShowFailuresChange,
  availableOperations,
  availableResources,
  onReset,
}: AuditLogFiltersProps) {
  const operationOptions = availableOperations || DEFAULT_OPERATIONS
  const resourceOptions = useMemo(
    () => availableResources || DEFAULT_RESOURCES,
    [availableResources]
  )

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FunnelSimple weight="bold" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="audit-log-search">Search</Label>
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="audit-log-search"
              placeholder="Search by user, resource, or error message"
              value={searchTerm}
              onChange={event => onSearchChange(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
          <div className="space-y-1">
            <Label htmlFor="audit-log-failures">Failures only</Label>
            <p className="text-xs text-muted-foreground">Show only unsuccessful operations</p>
          </div>
          <Switch
            id="audit-log-failures"
            checked={showFailuresOnly}
            onCheckedChange={onShowFailuresChange}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Operations</Label>
          <ToggleGroup
            type="multiple"
            value={selectedOperations}
            onValueChange={value => onOperationsChange(value as OperationType[])}
            className="flex flex-wrap gap-2"
          >
            {operationOptions.map(operation => (
              <ToggleGroupItem
                key={operation}
                value={operation}
                className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
              >
                {operation}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Resources</Label>
            <span className="text-xs text-muted-foreground">Select one or more</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {resourceOptions.map(resource => {
              const isSelected = selectedResources.includes(resource)
              return (
                <Button
                  key={resource}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    onResourcesChange(
                      isSelected
                        ? selectedResources.filter(value => value !== resource)
                        : [...selectedResources, resource]
                    )
                  }
                  className="rounded-full"
                >
                  <Badge
                    variant={isSelected ? 'default' : 'secondary'}
                    className="pointer-events-none bg-transparent px-0 text-xs capitalize"
                  >
                    {resource}
                  </Badge>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {selectedOperations.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <span className="font-medium">Operations:</span>
              <span>{selectedOperations.join(', ')}</span>
            </Badge>
          )}
          {selectedResources.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <span className="font-medium">Resources:</span>
              <span>{selectedResources.join(', ')}</span>
            </Badge>
          )}
          {showFailuresOnly && (
            <Badge variant="destructive" className="gap-1">
              <WarningIcon />
              Failures
            </Badge>
          )}
          {selectedOperations.length === 0 &&
            selectedResources.length === 0 &&
            !showFailuresOnly && <span>No filters applied</span>}
        </div>

        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto gap-1">
            <X className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </div>
    </div>
  )
}

function WarningIcon() {
  return <span className="inline-block h-3 w-3 rounded-full bg-destructive" />
}
