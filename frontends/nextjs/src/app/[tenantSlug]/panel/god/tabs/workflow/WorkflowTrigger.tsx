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
  /** Which form it answers. Only asked for when a form is the trigger. */
  formName: string
  onFormNameChange: (next: string) => void
  /** Forms this tenant's pages actually submit, offered as suggestions. */
  knownForms: string[]
}

export function WorkflowTrigger({
  value,
  onChange,
  formName,
  onFormNameChange,
  knownForms,
}: Props) {
  const listId = 'workflow-known-forms'
  return (
    <>
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
      {/*
        Only a form submission has a form to be scoped to. Left blank the
        workflow answers every form, which is what they all did before
        this asked -- so the placeholder says so rather than looking like
        a field somebody forgot.
      */}
      {value === 'FormSubmission.created' && (
        <label className={s.trigger}>
          <span className={s.triggerLabel}>from the form</span>
          <input
            className={s.triggerSelect}
            value={formName}
            list={listId}
            placeholder="any form"
            onChange={e => {
              onFormNameChange(e.target.value)
            }}
          />
          <datalist id={listId}>
            {knownForms.map(f => (
              <option key={f} value={f} />
            ))}
          </datalist>
        </label>
      )}
    </>
  )
}

export { TRIGGERS }
