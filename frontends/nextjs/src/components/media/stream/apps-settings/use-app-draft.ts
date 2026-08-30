'use client'

import { useState } from 'react'
import type { EmbedMode, StreamApp } from '../useStreamApps'
import { BLANK_DRAFT } from './blank-draft'
import { slugify } from './slugify'

interface Args {
  apps: StreamApp[]
  onCreate: (app: StreamApp) => Promise<void>
  onUpdate: (id: string, patch: Partial<StreamApp>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

/** The new-app form state, and the three busy-tracked actions on a modal
 *  row: add, change embed mode, delete. */
export function useAppDraft({ apps, onCreate, onUpdate, onDelete }: Args) {
  const [draft, setDraft] = useState<Omit<StreamApp, 'id'>>(BLANK_DRAFT)
  const [busy, setBusy] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const handleAdd = async () => {
    if (draft.name.trim() === '' || draft.url.trim() === '') {
      setFormError('Name and URL are required')
      return
    }
    setBusy('__new__')
    setFormError(null)
    try {
      await onCreate({
        id: `${slugify(draft.name)}-${Date.now().toString(36)}`,
        ...draft,
        sortOrder: apps.length,
      })
      setDraft(BLANK_DRAFT)
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to add app')
    } finally {
      setBusy(null)
    }
  }

  const handleEmbedModeChange = async (app: StreamApp, mode: EmbedMode) => {
    setBusy(app.id)
    try {
      await onUpdate(app.id, { embedMode: mode })
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async (id: string) => {
    setBusy(id)
    try {
      await onDelete(id)
    } finally {
      setBusy(null)
    }
  }

  return {
    draft,
    setDraft,
    busy,
    formError,
    handleAdd,
    handleEmbedModeChange,
    handleDelete,
  }
}
