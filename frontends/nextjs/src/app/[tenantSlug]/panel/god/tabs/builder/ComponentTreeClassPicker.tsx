'use client'

/**
 * Style classes for the selected node, sourced from the god panel's Styles
 * tab rather than typed blind: the classes offered here are exactly the ones
 * that tab defines, so a class chosen in the builder is one that will actually
 * exist in the published stylesheet.
 *
 * className stays a plain space-separated string -- the same thing the DOM
 * takes -- so a class the Styles tab does not know about (a global utility,
 * say) can still be typed in the field and is preserved.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TextField, Typography } from '@/m3'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'
import { useCssClasses } from '../styles/use-css-classes'
import s from './ComponentTreeTab.module.scss'

const split = (value: string): string[] =>
  value.split(/\s+/).filter(part => part !== '')

type Props = {
  value: string
  tenant: string
  onChange: (className: string) => void
}

export function ComponentTreeClassPicker({ value, tenant, onChange }: Props) {
  const { classes, hydrate } = useCssClasses()
  const applied = split(value)
  const [query, setQuery] = useState('')

  // Pull the tenant's published classes in, so the picker offers what the
  // Styles tab actually defines rather than only what this session created.
  useEffect(() => {
    hydrate(tenant)
  }, [hydrate, tenant])

  const toggle = (name: string) => {
    const next = applied.includes(name)
      ? applied.filter(part => part !== name)
      : [...applied, name]
    onChange(next.join(' '))
  }

  return (
    <>
      <TextField
        size="small"
        fullWidth
        label="CSS classes"
        placeholder="card card--wide"
        value={value}
        helperText="Space separated, same as the class attribute"
        onChange={event => {
          onChange(event.target.value)
        }}
      />

      {classes.length > 0 ? (
        <>
          {/* Worth a filter once the list is longer than a glance. Applied
              classes are never filtered out, so searching cannot hide what is
              already on the node. */}
          {classes.length > 8 && (
            <TextField
              size="small"
              fullWidth
              label="Find a style"
              value={query}
              onChange={event => {
                setQuery(event.target.value)
              }}
            />
          )}
          <div className={s.classChips}>
            {classes
              .filter(
                css =>
                  applied.includes(css.name) ||
                  css.name.toLowerCase().includes(query.trim().toLowerCase())
              )
              .map(css => {
                const on = applied.includes(css.name)
                return (
                  <button
                    key={css.id}
                    type="button"
                    className={`${s.classChip} ${on ? s.classChipOn : ''}`}
                    aria-pressed={on}
                    title={
                      Object.keys(css.props).length > 0
                        ? Object.entries(css.props)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join('\n')
                        : 'No declarations yet'
                    }
                    onClick={() => {
                      toggle(css.name)
                    }}
                  >
                    {on && (
                      <span
                        className="material-symbols-rounded"
                        aria-hidden="true"
                      >
                        check
                      </span>
                    )}
                    {css.name}
                  </button>
                )
              })}
          </div>
        </>
      ) : (
        <Typography variant="caption" className={s.propHint}>
          No classes defined yet.
        </Typography>
      )}

      <Link className={s.propLink} href={tenantGodPanelPath(tenant, 'styles')}>
        <span className="material-symbols-rounded" aria-hidden="true">
          palette
        </span>
        {classes.length > 0
          ? 'Edit classes in Styles'
          : 'Define classes in Styles'}
      </Link>
    </>
  )
}
