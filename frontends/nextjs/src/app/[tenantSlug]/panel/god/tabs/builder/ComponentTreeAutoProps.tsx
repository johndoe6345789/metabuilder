'use client'

/**
 * A block's own properties, beyond its one primary field (see
 * ComponentTreePrimaryField, which renders that field on its own).
 *
 * Driven by the block's declared schema (block-props.ts) where it has one:
 * real labels, help text, and a choice list where the prop has fixed values.
 * A block with no schema falls back to inferring fields from its `defaults`,
 * so a newly added block is editable before anyone writes a schema for it --
 * only ten of thirty-seven types had a hand-written editor, and the rest
 * claimed to have no properties at all.
 *
 * A `select` whose field names a `source` uses the tenant's own option list
 * from the Config tab when one exists, so a list like chat channels or icon
 * names can be changed without touching code.
 */

import { Typography } from '@/m3'
import type { TreeNode } from './builder-registry'
import { useDropdownConfigs } from '../config/use-dropdown-configs'
import { fieldWarning } from './field-warning'
import { AutoPropField } from './AutoPropField'
import { fieldsFor } from './primary-field'
import { mergedProps } from './node-props'
import s from './ComponentTreeTab.module.scss'

type Props = {
  node: TreeNode
  onChange: (patch: Record<string, unknown>) => void
  /** Skip this field -- it's already shown prominently on its own, see
   *  ComponentTreePrimaryField. */
  excludeField?: string
}

export function ComponentTreeAutoProps({
  node,
  onChange,
  excludeField,
}: Props) {
  const { configs } = useDropdownConfigs()
  const fields = fieldsFor(node.type).filter(f => f.name !== excludeField)

  if (fields.length === 0) {
    // A field to exclude means this type does have properties -- just
    // none beyond the one already shown above -- so saying nothing here
    // is correct, not a block that truly has none of its own.
    if (excludeField !== undefined) return null
    return (
      <Typography variant="body2" color="text.secondary">
        This block has no settings of its own.
      </Typography>
    )
  }

  const allProps = mergedProps(node)

  return (
    <div className={s.propCol}>
      {fields.map(field => {
        const current = allProps[field.name]
        return (
          <AutoPropField
            key={field.name}
            field={field}
            current={current}
            warning={fieldWarning(field, current, allProps)}
            configs={configs}
            fieldId={`prop-${node.id}-${field.name}`}
            onChange={onChange}
          />
        )
      })}
    </div>
  )
}
