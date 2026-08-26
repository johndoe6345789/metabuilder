'use client'

/**
 * A property editor derived from the block's own defaults.
 *
 * Only ten of the thirty-seven block types had a hand-written editor; the
 * rest reported "No editable properties", which was never true -- a tooltip's
 * text and an accordion's summary are both props, and neither could be
 * changed. Every block already declares its content props as `defaults`, so
 * that declaration is the editor: one field per key, typed by the default's
 * own type.
 *
 * A block with a bespoke editor keeps it; this is the fallback, so better
 * labelling and grouping stay possible where they are worth writing.
 */

import { TextField, Typography } from '@/m3'
import { paletteItem, type TreeNode } from './builder-registry'
import s from './ComponentTreeTab.module.scss'

/** "runWorkflow" -> "Run workflow", "src" -> "Src". */
function humanise(key: string): string {
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

type Props = {
  node: TreeNode
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeAutoProps({ node, onChange }: Props) {
  const defaults = paletteItem(node.type)?.defaults ?? {}
  const keys = Object.keys(defaults)

  if (keys.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        This block has no properties of its own — use Identity, Style and
        Accessibility above.
      </Typography>
    )
  }

  return (
    <div className={s.propCol}>
      {keys.map(key => {
        const fallback = defaults[key]
        const current = node.props[key] ?? fallback

        if (typeof fallback === 'boolean') {
          return (
            <label key={key} className={s.propCheck}>
              <input
                type="checkbox"
                checked={current === true}
                onChange={event => {
                  onChange({ [key]: event.target.checked })
                }}
              />
              <span>{humanise(key)}</span>
            </label>
          )
        }

        if (typeof fallback === 'number') {
          return (
            <TextField
              key={key}
              size="small"
              fullWidth
              type="number"
              label={humanise(key)}
              value={typeof current === 'number' ? String(current) : ''}
              onChange={event => {
                onChange({ [key]: Number(event.target.value) || 0 })
              }}
            />
          )
        }

        return (
          <TextField
            key={key}
            size="small"
            fullWidth
            label={humanise(key)}
            value={typeof current === 'string' ? current : ''}
            onChange={event => {
              onChange({ [key]: event.target.value })
            }}
          />
        )
      })}
    </div>
  )
}
