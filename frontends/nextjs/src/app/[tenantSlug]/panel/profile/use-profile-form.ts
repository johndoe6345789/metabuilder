'use client'

import { useState } from 'react'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export type SaveStatus = 'idle' | 'success' | 'error'

export interface ProfileFormState {
  editing: boolean
  email: string
  bio: string
  status: SaveStatus
  setEmail: (value: string) => void
  setBio: (value: string) => void
  startEditing: () => void
  cancel: () => void
  save: () => Promise<void>
}

export interface ProfileFormOptions {
  userId: string | null
  email: string
  bio: string
}

/**
 * The edit/save cycle for a user's own profile.
 *
 * Kept out of the view so the save path -- which writes to the data layer
 * and has three outcomes -- can be exercised without rendering a form.
 */
export function useProfileForm(options: ProfileFormOptions): ProfileFormState {
  const [editing, setEditing] = useState(false)
  const [email, setEmail] = useState(options.email)
  const [bio, setBio] = useState(options.bio)
  const [status, setStatus] = useState<SaveStatus>('idle')

  const cancel = (): void => {
    setEmail(options.email)
    setBio(options.bio)
    setStatus('idle')
    setEditing(false)
  }

  const startEditing = (): void => {
    setEditing(true)
    setStatus('idle')
  }

  const save = async (): Promise<void> => {
    if (options.userId === null) return
    try {
      const res = await fetch(
        `${DBAL_URL}/system/core/User/${options.userId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, bio }),
        }
      )
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setEditing(false)
    } catch {
      setStatus('error')
    }
  }

  return {
    editing,
    email,
    bio,
    status,
    setEmail,
    setBio,
    startEditing,
    cancel,
    save,
  }
}
