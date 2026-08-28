'use client'

/**
 * The properties every node has, whatever its type -- identity, styling and
 * accessibility -- in the spirit of a VB6 property sheet: select a control in
 * the tree, edit its attributes here.
 *
 * These map to real DOM attributes and are applied centrally by renderNode
 * (see COMMON_PROP_KEYS in blocks/common-attrs), so they work on every block type
 * rather than only the handful with bespoke editors.
 */

import { useId, useState } from 'react'
import { TextField, Typography } from '@/m3'
import type { TreeNode } from './builder-registry'
import { ComponentTreeClassPicker } from './ComponentTreeClassPicker'
import s from './ComponentTreeTab.module.scss'

const text = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : ''

/** A DOM id must be non-empty and contain no whitespace. */
function idError(value: string): string | null {
  if (value === '') return null
  if (/\s/.test(value)) return 'No spaces allowed'
  return null
}

type Section = 'identity' | 'style' | 'a11y'

type Props = {
  node: TreeNode
  tenant: string
  duplicateId: boolean
  onChange: (patch: Record<string, unknown>) => void
}

export function ComponentTreeCommonProps({
  node,
  tenant,
  duplicateId,
  onChange,
}: Props) {
  const [open, setOpen] = useState<Section | null>('identity')
  const p = node.props
  const domId = text(p.id)
  const idProblem =
    idError(domId) ?? (duplicateId ? 'Already used in this tree' : null)
  const uid = useId()

  const section = (key: Section, label: string, body: React.ReactNode) => {
    const isOpen = open === key
    return (
      <div className={s.propSection}>
        <button
          type="button"
          className={s.propSectionHead}
          aria-expanded={isOpen}
          aria-controls={`${uid}-${key}`}
          onClick={() => {
            setOpen(isOpen ? null : key)
          }}
        >
          <span
            className={`material-symbols-rounded ${s.propTwist} ${
              isOpen ? s.propTwistOpen : ''
            }`}
            aria-hidden="true"
          >
            chevron_right
          </span>
          {label}
        </button>
        {isOpen && (
          <div className={s.propCol} id={`${uid}-${key}`}>
            {body}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={s.propSections}>
      {section(
        'identity',
        'Identity',
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
            value={text(p.name)}
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
            value={text(p.testId)}
            helperText="data-testid, for automated tests"
            onChange={event => {
              onChange({ testId: event.target.value })
            }}
          />
        </>
      )}

      {section(
        'style',
        'Style',
        <ComponentTreeClassPicker
          value={text(p.className)}
          tenant={tenant}
          onChange={className => {
            onChange({ className })
          }}
        />
      )}

      {section(
        'a11y',
        'Accessibility',
        <>
          <TextField
            size="small"
            fullWidth
            label="Label (aria-label)"
            placeholder="Close dialog"
            value={text(p.ariaLabel)}
            helperText="Names the element when its own text does not"
            onChange={event => {
              onChange({ ariaLabel: event.target.value })
            }}
          />
          <TextField
            size="small"
            fullWidth
            label="Described by (aria-describedby)"
            placeholder="password-hint"
            value={text(p.ariaDescribedby)}
            helperText="ID of the element describing this one"
            onChange={event => {
              onChange({ ariaDescribedby: event.target.value })
            }}
          />
          <TextField
            size="small"
            fullWidth
            label="Role"
            placeholder="navigation"
            value={text(p.role)}
            helperText="Only when the element's own meaning is wrong"
            onChange={event => {
              onChange({ role: event.target.value })
            }}
          />
          <label className={s.propCheck}>
            <input
              type="checkbox"
              checked={p.ariaHidden === true || p.ariaHidden === 'true'}
              onChange={event => {
                onChange({ ariaHidden: event.target.checked ? 'true' : '' })
              }}
            />
            <span>
              Hide from screen readers
              <Typography
                variant="caption"
                component="span"
                className={s.propHint}
              >
                aria-hidden — for purely decorative elements
              </Typography>
            </span>
          </label>
        </>
      )}
    </div>
  )
}
