/**
 * useTranslationListRenderer
 *
 * Extracted from use-translation-editor.ts — generates
 * the `translationListContent` React element used by
 * JSON bindings that can't express render functions.
 */

import React, { useMemo } from 'react'
import type { TranslationRow } from './use-translation-editor'

// ── Styles ────────────────────────────────────────────────

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr auto',
  gap: '8px',
  padding: '8px 16px',
  alignItems: 'center',
  borderBottom:
    '1px solid var(--mat-sys-outline-variant)',
  fontSize: '13px',
}

const keyStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: '12px',
  color: 'var(--mat-sys-on-surface-variant)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const valueStyle: React.CSSProperties = {
  color: 'var(--mat-sys-on-surface)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const customBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  padding: '1px 6px',
  borderRadius: '8px',
  backgroundColor:
    'var(--mat-sys-tertiary-container)',
  color: 'var(--mat-sys-on-tertiary-container)',
  marginLeft: '6px',
  fontWeight: '600',
}

const btnBase: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid var(--mat-sys-outline-variant)',
  backgroundColor: 'transparent',
  color: 'var(--mat-sys-on-surface)',
  fontSize: '12px',
  cursor: 'pointer',
}

const saveBtnStyle: React.CSSProperties = {
  ...btnBase,
  backgroundColor: 'var(--mat-sys-primary)',
  color: 'var(--mat-sys-on-primary)',
  border: 'none',
}

const editInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid var(--mat-sys-primary)',
  backgroundColor:
    'var(--mat-sys-surface-container-low)',
  color: 'var(--mat-sys-on-surface)',
  fontSize: '13px',
}

// ── Hook ─────────────────────────────────────────────────

interface Args {
  rows: TranslationRow[]
  editingKey: string | null
  editValue: string
  onEdit: (key: string) => void
  onEditValueChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  onDelete: (key: string) => void
}

export function useTranslationListRenderer({
  rows,
  editingKey,
  editValue,
  onEdit,
  onEditValueChange,
  onSave,
  onCancel,
  onDelete,
}: Args) {
  const translationListContent = useMemo(() => {
    if (rows.length === 0) return null

    return React.createElement(
      React.Fragment,
      null,
      rows.slice(0, 100).map((row) => {
        const isEditing = editingKey === row.key

        return React.createElement(
          'div',
          { key: row.key, style: rowStyle },
          // Key column
          React.createElement(
            'div',
            { style: keyStyle, title: row.key },
            row.key,
            row.isOverridden
              ? React.createElement(
                  'span',
                  { style: customBadgeStyle },
                  'Custom'
                )
              : null
          ),
          // Value column
          isEditing
            ? React.createElement('input', {
                style: editInputStyle,
                value: editValue,
                onChange: (
                  e: React.ChangeEvent<HTMLInputElement>
                ) => onEditValueChange(e.target.value),
                autoFocus: true,
                onKeyDown: (
                  e: React.KeyboardEvent
                ) => {
                  if (e.key === 'Enter') onSave()
                  if (e.key === 'Escape') onCancel()
                },
              })
            : React.createElement(
                'div',
                {
                  style: valueStyle,
                  title: row.currentValue,
                },
                row.currentValue
              ),
          // Actions column
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '4px',
                justifyContent: 'flex-end',
              },
            },
            isEditing
              ? [
                  React.createElement(
                    'button',
                    {
                      key: 'save',
                      style: saveBtnStyle,
                      onClick: onSave,
                      type: 'button',
                    },
                    'Save'
                  ),
                  React.createElement(
                    'button',
                    {
                      key: 'cancel',
                      style: btnBase,
                      onClick: onCancel,
                      type: 'button',
                    },
                    'Cancel'
                  ),
                ]
              : [
                  React.createElement(
                    'button',
                    {
                      key: 'edit',
                      style: btnBase,
                      onClick: () => onEdit(row.key),
                      type: 'button',
                    },
                    'Edit'
                  ),
                  row.isOverridden
                    ? React.createElement(
                        'button',
                        {
                          key: 'reset',
                          style: {
                            ...btnBase,
                            color: 'var(--mat-sys-error)',
                            borderColor:
                              'var(--mat-sys-error)',
                          },
                          onClick: () =>
                            onDelete(row.key),
                          type: 'button',
                        },
                        'Reset'
                      )
                    : null,
                ]
          )
        )
      })
    )
  }, [
    rows,
    editingKey,
    editValue,
    onEdit,
    onEditValueChange,
    onSave,
    onCancel,
    onDelete,
  ])

  return { translationListContent }
}
