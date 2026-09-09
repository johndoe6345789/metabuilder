'use client'

import Link from 'next/link'
import { SOFT_PILL_RADIUS } from './radii'

export interface EntityFormActionsProps {
  error: string | null
  saving: boolean
  submitLabel: string
  canSubmit: boolean
  cancelHref: string
}

/** The save button, the way back, and why the last save did not happen. */
export function EntityFormActions(props: EntityFormActionsProps) {
  return (
    <>
      {props.error !== null && (
        <p role="alert" style={{ color: '#c62828', marginBottom: '1rem' }}>
          {props.error}
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="submit"
          disabled={props.saving || !props.canSubmit}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: props.canSubmit ? '#1976d2' : '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: SOFT_PILL_RADIUS,
            cursor: props.canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          {props.saving ? 'Saving…' : props.submitLabel}
        </button>
        <Link
          href={props.cancelHref}
          style={{
            padding: '0.5rem 1.5rem',
            backgroundColor: '#f5f5f5',
            color: '#424242',
            textDecoration: 'none',
            border: '1px solid #e0e0e0',
            borderRadius: SOFT_PILL_RADIUS,
            display: 'inline-block',
          }}
        >
          Cancel
        </Link>
      </div>
    </>
  )
}
