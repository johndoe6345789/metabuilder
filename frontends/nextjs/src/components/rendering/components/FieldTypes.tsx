import { Palette } from '@/fakemui/icons'

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import type { DropdownConfig } from '@/lib/database'
import type { PropDefinition } from '@/lib/types/builder-types'
import type { JsonValue } from '@/types/utility-types'

interface FieldTypesProps {
  propDef: PropDefinition
  value: JsonValue
  onChange: (value: JsonValue) => void
  dynamicDropdown?: DropdownConfig | null
  onOpenCssBuilder?: () => void
}

export function FieldTypes({
  propDef,
  value,
  onChange,
  dynamicDropdown,
  onOpenCssBuilder,
}: FieldTypesProps) {
  const renderInputByType = () => {
    if (propDef.name === 'className') {
      return (
        <div className="flex gap-2">
          <Input
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="flex-1 font-mono text-xs"
          />
          {onOpenCssBuilder && (
            <Button size="sm" variant="outline" onClick={onOpenCssBuilder}>
              <Palette size={16} />
            </Button>
          )}
        </div>
      )
    }

    switch (propDef.type) {
      case 'string':
        return <Input value={value || ''} onChange={e => onChange(e.target.value)} />
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={e => onChange(Number(e.target.value))}
          />
        )
      case 'boolean':
        return (
          <Select value={String(value || false)} onValueChange={val => onChange(val === 'true')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )
      case 'select': {
        const selectValue =
          typeof value === 'string'
            ? value
            : typeof propDef.defaultValue === 'string'
              ? propDef.defaultValue
              : ''
        return (
          <Select value={selectValue} onValueChange={val => onChange(val)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {propDef.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }
      case 'dynamic-select':
        return (
          <Select value={value || ''} onValueChange={val => onChange(val)}>
            <SelectTrigger>
              <SelectValue
                placeholder={dynamicDropdown ? `Select ${dynamicDropdown.label}` : 'Select option'}
              />
            </SelectTrigger>
            <SelectContent>
              {dynamicDropdown?.options.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider">{propDef.label}</Label>
      {renderInputByType()}
      {propDef.description && (
        <p className="text-xs text-muted-foreground">{propDef.description}</p>
      )}
    </div>
  )
}
