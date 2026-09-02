'use client'

/**
 * Style classes for the selected node, sourced from the god panel's Styles
 * tab rather than typed blind: the chips offered here are exactly the ones
 * that tab defines, so applying one is a click, never typing. A class the
 * Styles tab doesn't know about (a global utility, say) still reaches the
 * node -- that's rare enough to live behind the "Advanced" disclosure below
 * rather than in a text box everyone has to look at first.
 */

import { useEffect } from 'react'
import Link from 'next/link'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'
import { useCssClasses } from '../styles/use-css-classes'
import { useAdvancedClassesOpen } from './use-advanced-classes-open'
import { ClassChipList } from './ClassChipList'
import { AdvancedClassInput } from './AdvancedClassInput'
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
  const [advancedOpen, toggleAdvanced] = useAdvancedClassesOpen(
    applied,
    classes
  )

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
      <ClassChipList
        classes={classes}
        applied={applied}
        tenant={tenant}
        onToggle={toggle}
      />

      <AdvancedClassInput
        value={value}
        open={advancedOpen}
        onToggleOpen={toggleAdvanced}
        onChange={onChange}
      />

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
