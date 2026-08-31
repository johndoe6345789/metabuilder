'use client'

import { TextField } from '@/m3'
import { text, idError } from './text'

export interface IdentityFieldsProps {
  props: Record<string, unknown>
  duplicateId: boolean
  onChange: (patch: Record<string, unknown>) => void
}

export function IdentityFields({
  props,
  duplicateId,
  onChange,
}: IdentityFieldsProps) {
  const domId = text(props.id)
  const idProblem =
    idError(domId) ?? (duplicateId ? 'Already used in this tree' : null)

  return (
    <>
      <TextField
        size="small"
        fullWidth
        label="ID"
        placeholder="contact-form"
        value={domId}
        error={idProblem !== null}
        helperText={idProblem ?? 'Used for anchors and aria references'}
        onChange={event => {
          onChange({ id: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Name"
        placeholder="email"
        value={text(props.name)}
        helperText="Form field name, submitted with the form"
        onChange={event => {
          onChange({ name: event.target.value })
        }}
      />
      <TextField
        size="small"
        fullWidth
        label="Test ID"
        placeholder="submit-button"
        value={text(props.testId)}
        helperText="data-testid, for automated tests"
        onChange={event => {
          onChange({ testId: event.target.value })
        }}
      />
    </>
  )
}
