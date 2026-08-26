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

import { FormControl, FormLabel, Select, TextField, Typography } from '@/m3'
import { paletteItem, type TreeNode } from './builder-registry'
import { propSchema, type PropField } from '@/components/blocks/block-props'
import { useDropdownConfigs } from '../config/use-dropdown-configs'
import s from './ComponentTreeTab.module.scss'

/** "runWorkflow" -> "Run workflow", "src" -> "Src". */
function humanise(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Fields inferred from defaults, for a block with no schema of its own. */
function inferred(defaults: Record<string, unknown>): PropField[] {
  return Object.entries(defaults).map(([name, value]) => ({
    name,
    label: humanise(name),
    type:
      typeof value === 'boolean'
        ? 'boolean'
        : typeof value === 'number'
          ? 'number'
          : 'text',
  }))
}

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
      {fields.map(field => {
        const current = node.props[field.name] ?? defaults[field.name]

        if (field.type === 'boolean') {
          return (
            <label key={field.name} className={s.propCheck}>
              <input
                type="checkbox"
                checked={current === true}
                onChange={event => {
                  onChange({ [field.name]: event.target.checked })
                }}
              />
              <span>
                {field.label}
                {field.hint !== undefined && (
                  <Typography variant="caption" component="span" className={s.propHint}>
                    {field.hint}
                  </Typography>
                )}
              </span>
            </label>
          )
        }

        if (field.type === 'select') {
          // The tenant's own list wins over the built-in choices.
          const custom =
            field.source === undefined
              ? undefined
              : configs.find(c => c.name === field.source)
          const options = custom?.options ?? field.options ?? []
          const id = `prop-${node.id}-${field.name}`
          return (
            <FormControl key={field.name}>
              <FormLabel htmlFor={id}>{field.label}</FormLabel>
              <Select
                native
                value={typeof current === 'string' ? current : ''}
                inputProps={{ id }}
                onChange={
                  ((event: React.ChangeEvent<HTMLSelectElement>) => {
                    onChange({ [field.name]: event.target.value })
                  }) as never
                }
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {field.hint !== undefined && (
                <Typography variant="caption" className={s.propHint}>
                  {field.hint}
                </Typography>
              )}
            </FormControl>
          )
        }

        if (field.type === 'number') {
          return (
            <TextField
              key={field.name}
              size="small"
              fullWidth
              type="number"
              label={field.label}
              helperText={field.hint}
              value={typeof current === 'number' ? String(current) : ''}
              onChange={event => {
                onChange({ [field.name]: Number(event.target.value) || 0 })
              }}
            />
          )
        }

        return (
          <TextField
            key={field.name}
            size="small"
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            helperText={field.hint}
            value={typeof current === 'string' ? current : ''}
            onChange={event => {
              onChange({ [field.name]: event.target.value })
            }}
          />
        )
      })}
    </div>
  )
}
