'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EntityFormField } from './EntityFormField'
import { EntityFormActions } from './EntityFormActions'
import { initialValues, toRecord, type FormField } from './entity-form-fields'
import { submitEntity, type SubmitTarget } from './submit-entity'

export interface EntityFormProps {
  fields: FormField[]
  record: Record<string, unknown>
  target: SubmitTarget
  submitLabel: string
}

/**
 * The create and edit forms, which now write.
 *
 * Both rendered inputs nothing read, under a `type="button"` with no
 * handler -- so filling one in and pressing the button did nothing at
 * all, and looked exactly like success.
 */
export function EntityForm({
  fields,
  record,
  target,
  submitLabel,
}: EntityFormProps) {
  const router = useRouter()
  const [values, setValues] = useState(() => initialValues(fields, record))
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async (): Promise<void> => {
    setSaving(true)
    const refusal = await submitEntity(target, toRecord(fields, values))
    setSaving(false)
    setError(refusal)
    if (refusal !== null) return
    const { tenant, pkg, entity, id } = target
    router.push(`/${tenant}/${pkg}/${entity}${id === undefined ? '' : `/${id}`}`)
    router.refresh()
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        void save()
      }}
    >
      {fields.length === 0 && (
        <p style={{ color: '#666' }}>
          Nothing here says what fields {target.entity} has — no package
          schema, and no record to read them from.
        </p>
      )}

      {fields.map(field => (
        <EntityFormField
          key={field.name}
          field={field}
          value={values[field.name] ?? ''}
          onChange={next => {
            setValues(prev => ({ ...prev, [field.name]: next }))
          }}
        />
      ))}

      <EntityFormActions
        error={error}
        saving={saving}
        submitLabel={submitLabel}
        canSubmit={fields.length > 0}
        cancelHref={`/${target.tenant}/${target.pkg}/${target.entity}`}
      />
    </form>
  )
}
