'use client'

import { SearchSelect } from '@/components/search-select/SearchSelect'
import { PackageContentsList } from '../PackageContentsList'
import type { PackageRef } from '../use-package-registry'

export interface PackageContentPickerProps {
  tenant: string
  packageName: string
  entity: string
  placeholder: string
  getLabel: (r: Record<string, unknown>) => string
  items: PackageRef[]
  onSelect: (item: PackageRef) => void
  onReorder: (from: number, to: number) => void
  onRemove: (id: string) => void
}

/** Search for content to add, and the reorderable list of what's added. */
export function PackageContentPicker(props: PackageContentPickerProps) {
  return (
    <>
      <SearchSelect
        tenant={props.tenant}
        packageName={props.packageName}
        entity={props.entity}
        placeholder={props.placeholder}
        getLabel={props.getLabel}
        onSelect={props.onSelect}
      />
      <PackageContentsList
        items={props.items}
        onReorder={props.onReorder}
        onRemove={props.onRemove}
      />
    </>
  )
}
