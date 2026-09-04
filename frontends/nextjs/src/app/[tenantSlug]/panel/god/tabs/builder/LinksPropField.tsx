'use client'

/**
 * A row per link, rather than the one delimited line the value is stored
 * as. The stored format ("Home->/|About->/about") is a storage detail;
 * asking an author to type it -- and to know that "->" separates a label
 * from a path while "|" separates whole links -- is asking them to learn a
 * syntax to do something the interface can just show them.
 */

import { TextField } from '@/m3'
import type { PropField } from '@/components/blocks/block-props'
import {
  formatNavLinks,
  parseNavLinks,
  type NavLink,
} from '@/components/blocks/block-coerce'
import s from './LinksPropField.module.scss'

export interface LinksPropFieldProps {
  field: PropField
  current: unknown
  onChange: (patch: Record<string, unknown>) => void
}

export function LinksPropField({
  field,
  current,
  onChange,
}: LinksPropFieldProps) {
  const links = parseNavLinks(current)

  const commit = (next: NavLink[]): void => {
    onChange({ [field.name]: formatNavLinks(next) })
  }
  const update = (index: number, patch: Partial<NavLink>): void => {
    commit(links.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  return (
    <div className={s.root}>
      <div className={s.label}>{field.label}</div>

      {links.map((link, i) => (
        <div className={s.row} key={i}>
          <TextField
            size="small"
            label="Text"
            placeholder="About"
            value={link.label}
            onChange={e => {
              update(i, { label: e.target.value })
            }}
          />
          <TextField
            size="small"
            label="Goes to"
            placeholder="/about"
            value={link.href}
            onChange={e => {
              update(i, { href: e.target.value })
            }}
          />
          <button
            type="button"
            className={s.remove}
            aria-label={`Remove ${link.label === '' ? 'link' : link.label}`}
            onClick={() => {
              commit(links.filter((_, at) => at !== i))
            }}
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        className={s.add}
        onClick={() => {
          commit([...links, { label: '', href: '' }])
        }}
      >
        + Add link
      </button>

      {field.hint !== undefined && <div className={s.hint}>{field.hint}</div>}
    </div>
  )
}
