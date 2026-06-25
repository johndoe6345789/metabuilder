/**
 * useTranslationEditCRUD
 *
 * Inline-editing CRUD for translation rows:
 * start edit, change value, save to DBAL,
 * cancel, and delete (reset to static default).
 */

import { useState, useCallback } from 'react'
import { useAppDispatch } from '@/store'
import {
  upsertTranslation,
  deleteTranslation,
} from '@/store/slices/translationsSlice'
import { toast } from '@/components/ui/sonner'

interface UseTranslationEditCRUDArgs {
  locale: string
  overrides: Record<
    string,
    { value: string } | undefined
  >
  staticTranslations: Array<{
    key: string
    value: string
  }>
}

export function useTranslationEditCRUD({
  locale,
  overrides,
  staticTranslations,
}: UseTranslationEditCRUDArgs) {
  const dispatch = useAppDispatch()
  const [editingKey, setEditingKey] = useState<
    string | null
  >(null)
  const [editValue, setEditValue] = useState('')

  const handleEdit = useCallback(
    (key: string) => {
      setEditingKey(key)
      const override = overrides[key]
      const staticEntry = staticTranslations.find(
        (e) => e.key === key
      )
      setEditValue(
        override?.value ?? staticEntry?.value ?? ''
      )
    },
    [overrides, staticTranslations]
  )

  const handleEditValueChange = useCallback(
    (
      valueOrEvent:
        | string
        | { target: { value: string } }
    ) => {
      const value =
        typeof valueOrEvent === 'string'
          ? valueOrEvent
          : valueOrEvent.target.value
      setEditValue(value)
    },
    []
  )

  const handleSave = useCallback(async () => {
    if (!editingKey) return
    try {
      await dispatch(
        upsertTranslation({
          locale,
          key: editingKey,
          value: editValue,
        })
      ).unwrap()
      toast.success(
        `Translation saved: ${editingKey}`
      )
      setEditingKey(null)
      setEditValue('')
    } catch (err: any) {
      toast.error(
        err?.message ||
          'Failed to save translation'
      )
    }
  }, [dispatch, locale, editingKey, editValue])

  const handleCancel = useCallback(() => {
    setEditingKey(null)
    setEditValue('')
  }, [])

  const handleDelete = useCallback(
    async (key: string) => {
      try {
        await dispatch(
          deleteTranslation({ locale, key })
        ).unwrap()
        toast.success(`Translation reset: ${key}`)
        if (editingKey === key) {
          setEditingKey(null)
          setEditValue('')
        }
      } catch (err: any) {
        toast.error(
          err?.message ||
            'Failed to reset translation'
        )
      }
    },
    [dispatch, locale, editingKey]
  )

  return {
    editingKey,
    editValue,
    handleEdit,
    handleEditValueChange,
    handleSave,
    handleCancel,
    handleDelete,
  }
}
