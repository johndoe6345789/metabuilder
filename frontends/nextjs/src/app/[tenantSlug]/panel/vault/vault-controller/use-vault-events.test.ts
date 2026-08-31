import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useState } from 'react'

import { useVaultEvents } from './use-vault-events'
import type { VaultDraft } from '../vault-types'

const blankDraft: VaultDraft = {
  slug: '',
  title: '',
  username: '',
  password: '',
  group: '',
  notes: '',
  loginUrl: '',
  appUrl: '',
}

function setup() {
  return renderHook(() => {
    const [draft, setDraft] = useState(blankDraft)
    const events = useVaultEvents({
      setDraft,
      setSearch: vi.fn(),
      setMasterPassword: vi.fn(),
      setEditorTab: vi.fn(),
      reload: vi.fn(),
      lock: vi.fn(),
      newEntry: vi.fn(),
      save: vi.fn(),
      remove: vi.fn(),
      selectEntry: vi.fn(),
      unlock: vi.fn(),
      copyUsername: vi.fn(),
      copyPassword: vi.fn(),
      copyTurbologin: vi.fn(),
    })
    return { draft, events }
  })
}

describe('useVaultEvents updateDraft', () => {
  it('updates a single field', () => {
    const { result } = setup()
    act(() => result.current.events.updateDraft('title', 'Hello'))
    expect(result.current.draft.title).toBe('Hello')
  })

  it('applies several updates made in the same batch, not just the last', () => {
    // Regression: an earlier version captured a stale `draft` snapshot in
    // the closure, so calling updateDraft three times before a re-render
    // silently dropped the first two.
    const { result } = setup()
    act(() => {
      result.current.events.updateDraft('title', 'T')
      result.current.events.updateDraft('username', 'u')
      result.current.events.updateDraft('password', 'p')
    })
    expect(result.current.draft).toMatchObject({
      title: 'T',
      username: 'u',
      password: 'p',
    })
  })
})
