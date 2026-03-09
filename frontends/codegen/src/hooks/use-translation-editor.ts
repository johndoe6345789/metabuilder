/**
 * useTranslationEditor Hook
 *
 * Powers the Settings → Language tab. Manages:
 * - Locale selection dropdown
 * - Filterable list of all translation keys
 * - Inline editing with save/cancel/delete
 * - DBAL persistence for overrides
 * - Visual "Custom" badge for DBAL-overridden keys
 *
 * Returns a `translationListContent` React element for the row list,
 * since JSON definitions can't express render functions.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/store'
import {
  setLocale as setLocaleAction,
  fetchTranslations,
  upsertTranslation,
  deleteTranslation,
} from '@/store/slices/translationsSlice'
import {
  getTranslation,
  supportedLocales,
  localeNames,
} from '@metabuilder/translations'
import { toast } from '@/components/ui/sonner'

export interface TranslationRow {
  key: string
  staticValue: string
  currentValue: string
  isOverridden: boolean
}

/**
 * Flatten a nested JSON object into dot-notation key-value pairs
 */
function flattenTranslations(
  obj: Record<string, any>,
  prefix: string = ''
): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = []
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (typeof v === 'string') {
      result.push({ key: fullKey, value: v })
    } else if (typeof v === 'object' && v !== null) {
      result.push(...flattenTranslations(v, fullKey))
    }
  }
  return result
}

// ── Inline styles (CSS variables for theming) ─────────────────────────────

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr auto',
  gap: '8px',
  padding: '8px 16px',
  alignItems: 'center',
  borderBottom: '1px solid var(--mat-sys-outline-variant)',
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
  backgroundColor: 'var(--mat-sys-tertiary-container)',
  color: 'var(--mat-sys-on-tertiary-container)',
  marginLeft: '6px',
  fontWeight: '600',
}

const actionBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid var(--mat-sys-outline-variant)',
  backgroundColor: 'transparent',
  color: 'var(--mat-sys-on-surface)',
  fontSize: '12px',
  cursor: 'pointer',
}

const saveBtnStyle: React.CSSProperties = {
  ...actionBtnStyle,
  backgroundColor: 'var(--mat-sys-primary)',
  color: 'var(--mat-sys-on-primary)',
  border: 'none',
}

const editInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '4px 8px',
  borderRadius: '6px',
  border: '1px solid var(--mat-sys-primary)',
  backgroundColor: 'var(--mat-sys-surface-container-low)',
  color: 'var(--mat-sys-on-surface)',
  fontSize: '13px',
}

export function useTranslationEditor() {
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.translations.locale)
  const overrides = useAppSelector((state) => state.translations.overrides)
  const translationStatus = useAppSelector((state) => state.translations.status)

  const [filterQuery, setFilterQueryState] = useState('')
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValueState] = useState('')

  // Fetch translations when locale changes
  useEffect(() => {
    dispatch(fetchTranslations(locale))
  }, [dispatch, locale])

  // ── Locale dropdown ──────────────────────────────────────────────────────

  const localeOptions = useMemo(() => {
    return supportedLocales.map((code) => ({
      value: code,
      label: `${localeNames[code]} (${code})`,
    }))
  }, [])

  const handleLocaleChange = useCallback(
    (valueOrEvent: string | { target: { value: string } }) => {
      const newLocale =
        typeof valueOrEvent === 'string'
          ? valueOrEvent
          : valueOrEvent.target.value
      dispatch(setLocaleAction(newLocale))
    },
    [dispatch]
  )

  // ── Filter ───────────────────────────────────────────────────────────────

  const handleFilterChange = useCallback(
    (valueOrEvent: string | { target: { value: string } }) => {
      const value =
        typeof valueOrEvent === 'string'
          ? valueOrEvent
          : valueOrEvent.target.value
      setFilterQueryState(value)
    },
    []
  )

  // ── Translation rows ────────────────────────────────────────────────────

  const staticTranslations = useMemo(() => {
    const data = getTranslation(locale as any)
    return flattenTranslations(data)
  }, [locale])

  const rows = useMemo((): TranslationRow[] => {
    const normalizedFilter = filterQuery.toLowerCase()
    return staticTranslations
      .filter((entry) => {
        if (!normalizedFilter) return true
        return (
          entry.key.toLowerCase().includes(normalizedFilter) ||
          entry.value.toLowerCase().includes(normalizedFilter)
        )
      })
      .map((entry) => {
        const override = overrides[entry.key]
        return {
          key: entry.key,
          staticValue: entry.value,
          currentValue: override?.value ?? entry.value,
          isOverridden: !!override,
        }
      })
  }, [staticTranslations, overrides, filterQuery])

  // ── Editing handlers ──────────────────────────────────────────────────────

  const handleEdit = useCallback(
    (key: string) => {
      setEditingKey(key)
      const override = overrides[key]
      const staticEntry = staticTranslations.find((e) => e.key === key)
      setEditValueState(override?.value ?? staticEntry?.value ?? '')
    },
    [overrides, staticTranslations]
  )

  const handleEditValueChange = useCallback(
    (valueOrEvent: string | { target: { value: string } }) => {
      const value =
        typeof valueOrEvent === 'string'
          ? valueOrEvent
          : valueOrEvent.target.value
      setEditValueState(value)
    },
    []
  )

  const handleSave = useCallback(async () => {
    if (!editingKey) return
    try {
      await dispatch(
        upsertTranslation({ locale, key: editingKey, value: editValue })
      ).unwrap()
      toast.success(`Translation saved: ${editingKey}`)
      setEditingKey(null)
      setEditValueState('')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save translation')
    }
  }, [dispatch, locale, editingKey, editValue])

  const handleCancel = useCallback(() => {
    setEditingKey(null)
    setEditValueState('')
  }, [])

  const handleDelete = useCallback(
    async (key: string) => {
      try {
        await dispatch(deleteTranslation({ locale, key })).unwrap()
        toast.success(`Translation reset: ${key}`)
        if (editingKey === key) {
          setEditingKey(null)
          setEditValueState('')
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to reset translation')
      }
    },
    [dispatch, locale, editingKey]
  )

  // ── React element for row list (JSON can't express render functions) ───

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
              ? React.createElement('span', { style: customBadgeStyle }, 'Custom')
              : null
          ),
          // Value column
          isEditing
            ? React.createElement('input', {
                style: editInputStyle,
                value: editValue,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  handleEditValueChange(e.target.value),
                autoFocus: true,
                onKeyDown: (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') handleSave()
                  if (e.key === 'Escape') handleCancel()
                },
              })
            : React.createElement(
                'div',
                { style: valueStyle, title: row.currentValue },
                row.currentValue
              ),
          // Actions column
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '4px', justifyContent: 'flex-end' } },
            isEditing
              ? [
                  React.createElement(
                    'button',
                    {
                      key: 'save',
                      style: saveBtnStyle,
                      onClick: handleSave,
                      type: 'button',
                    },
                    'Save'
                  ),
                  React.createElement(
                    'button',
                    {
                      key: 'cancel',
                      style: actionBtnStyle,
                      onClick: handleCancel,
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
                      style: actionBtnStyle,
                      onClick: () => handleEdit(row.key),
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
                            ...actionBtnStyle,
                            color: 'var(--mat-sys-error)',
                            borderColor: 'var(--mat-sys-error)',
                          },
                          onClick: () => handleDelete(row.key),
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
  }, [rows, editingKey, editValue, handleEdit, handleEditValueChange, handleSave, handleCancel, handleDelete])

  // ── Pre-computed values for JSON bindings ────────────────────────────────

  const totalKeys = staticTranslations.length
  const overrideCount = Object.keys(overrides).length
  const filteredCount = rows.length
  const isLoading = translationStatus === 'loading'
  const showEmpty = rows.length === 0 && filterQuery.length > 0
  const showRows = rows.length > 0
  const localeName = localeNames[locale as keyof typeof localeNames] || locale

  return {
    // Locale
    locale,
    localeOptions,
    localeName,
    handleLocaleChange,

    // Filter
    filterQuery,
    handleFilterChange,

    // Data
    rows,
    totalKeys,
    overrideCount,
    filteredCount,
    isLoading,
    showEmpty,
    showRows,

    // React element for the translation list
    translationListContent,

    // Editing (exposed for potential external use)
    editingKey,
    editValue,
    handleEdit,
    handleEditValueChange,
    handleSave,
    handleCancel,
    handleDelete,
  }
}
