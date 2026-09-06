'use client'

import s from '../WorkflowsTab.module.scss'

/**
 * What sets this workflow running.
 *
 * DBAL fires "<tenant>.<Entity>.created" on every create and runs the
 * workflow the tenant published for it -- so this is the whole connection
 * between a page and a workflow. A form on a published page writes a
 * FormSubmission, which is why that is the option that matters here.
 */
const TRIGGERS: { value: string; label: string }[] = [
  { value: '', label: 'Nothing — only when I run it here' },
  { value: 'FormSubmission.created', label: 'Someone submits a form' },
  { value: 'User.created', label: 'Someone joins' },
]

interface Props {
  value: string
  onChange: (next: string) => void
}

export function WorkflowTrigger({ value, onChange }: Props) {
  return (
    <label className={s.trigger}>
      <span className={s.triggerLabel}>Runs when</span>
      <select
        className={s.triggerSelect}
        value={value}
        onChange={e => {
          onChange(e.target.value)
        }}
      >
        {TRIGGERS.map(t => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export { TRIGGERS }
