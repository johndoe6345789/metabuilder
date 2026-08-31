'use client'

/**
 * A block's own properties.
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
import { paletteItem, type TreeNode } from './builder-registry'
import { propSchema } from '@/components/blocks/block-props'
import { useDropdownConfigs } from '../config/use-dropdown-configs'
import { inferred } from './auto-props-infer'
import { AutoPropField } from './AutoPropField'
import s from './ComponentTreeTab.module.scss'

type Props = {
  node: TreeNode
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeAutoProps({ node, onChange }: Props) {
  const { configs } = useDropdownConfigs()
  const defaults = paletteItem(node.type)?.defaults ?? {}
  const fields = propSchema(node.type) ?? inferred(defaults)

  if (fields.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        This block has no properties of its own — use Identity, Style and
        Accessibility above.
      </Typography>
    )
  }

  return (
    <div className={s.propCol}>
      {fields.map(field => (
        <AutoPropField
          key={field.name}
          field={field}
          current={node.props[field.name] ?? defaults[field.name]}
          configs={configs}
          fieldId={`prop-${node.id}-${field.name}`}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
