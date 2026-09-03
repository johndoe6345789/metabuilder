'use client'

/**
 * The one field an author actually has to fill in for most blocks -- its
 * own text. Everything else about this block, and every identity/
 * accessibility field, is either inferred from it (see auto-identity.ts) or
 * tucked under "More options" (see ComponentTreeMoreOptions) so the panel
 * opens on the single decision that matters.
 */

import type { TreeNode } from './builder-registry'
import { AutoPropField } from './AutoPropField'
import { useDropdownConfigs } from '../config/use-dropdown-configs'
import { fieldWarning } from './field-warning'
import { primaryField } from './primary-field'
import { mergedProps } from './node-props'

type Props = {
  node: TreeNode
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreePrimaryField({ node, onChange }: Props) {
  const { configs } = useDropdownConfigs()
  const field = primaryField(node.type)
  if (field === undefined) return null

  const allProps = mergedProps(node)
  const current = allProps[field.name]

  return (
    <AutoPropField
      field={field}
      current={current}
      warning={fieldWarning(field, current, allProps)}
      configs={configs}
      fieldId={`prop-${node.id}-${field.name}-primary`}
      onChange={onChange}
    />
  )
}
