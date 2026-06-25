import { describe, expect, it, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

const mockListFromDBAL = vi.fn().mockResolvedValue([])
const mockSyncToDBAL = vi.fn().mockResolvedValue(undefined)
const mockDeleteFromDBAL = vi.fn().mockResolvedValue(undefined)

vi.mock('@/store/middleware/dbalSync', () => ({
  listFromDBAL: (...args: any[]) => mockListFromDBAL(...args),
  syncToDBAL: (...args: any[]) => mockSyncToDBAL(...args),
  deleteFromDBAL: (...args: any[]) => mockDeleteFromDBAL(...args),
}))

vi.mock('@metabuilder/translations', () => ({
  defaultLocale: 'en',
}))

import reducer, {
  setLocale,
  clearTranslationOverrides,
  fetchTranslations,
  upsertTranslation,
  deleteTranslation,
} from './translationsSlice'

describe('translationsSlice reducer', () => {
  const empty = {
    locale: 'en',
    overrides: {},
    status: 'idle' as const,
    error: null,
  }

  it('returns initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(empty)
  })

  describe('setLocale', () => {
    it('sets the locale and clears overrides', () => {
      let state = reducer(empty, setLocale('nl'))
      expect(state.locale).toBe('nl')
      expect(state.overrides).toEqual({})
      expect(state.status).toBe('idle')
    })
  })

  describe('clearTranslationOverrides', () => {
    it('clears overrides', () => {
      const stateWithOverrides = {
        ...empty,
        overrides: { 'btn.save': { key: 'btn.save', value: 'Opslaan' } },
      }
      const state = reducer(stateWithOverrides, clearTranslationOverrides())
      expect(state.overrides).toEqual({})
    })
  })

  describe('fetchTranslations async actions', () => {
    it('sets status to loading on pending', () => {
      const action = { type: 'translations/fetchTranslations/pending' }
      const state = reducer(empty, action)
      expect(state.status).toBe('loading')
      expect(state.error).toBeNull()
    })

    it('sets status to success and updates overrides on fulfilled', () => {
      const action = {
        type: 'translations/fetchTranslations/fulfilled',
        payload: {
          locale: 'nl',
          overrides: { 'btn.save': { key: 'btn.save', value: 'Opslaan' } },
        },
      }
      const state = reducer(empty, action)
      expect(state.status).toBe('success')
      expect(state.locale).toBe('nl')
      expect(state.overrides['btn.save'].value).toBe('Opslaan')
    })

    it('sets status to error on rejected', () => {
      const action = {
        type: 'translations/fetchTranslations/rejected',
        payload: 'fetch failed',
      }
      const state = reducer(empty, action)
      expect(state.status).toBe('error')
      expect(state.error).toBe('fetch failed')
    })
  })

  describe('upsertTranslation async actions', () => {
    it('adds a new translation override on fulfilled', () => {
      const action = {
        type: 'translations/upsertTranslation/fulfilled',
        payload: { key: 'btn.cancel', value: 'Annuleren' },
      }
      const state = reducer(empty, action)
      expect(state.overrides['btn.cancel']).toEqual({ key: 'btn.cancel', value: 'Annuleren' })
    })

    it('overwrites existing override on fulfilled', () => {
      const stateWithOverride = {
        ...empty,
        overrides: { 'btn.save': { key: 'btn.save', value: 'Old' } },
      }
      const action = {
        type: 'translations/upsertTranslation/fulfilled',
        payload: { key: 'btn.save', value: 'New' },
      }
      const state = reducer(stateWithOverride, action)
      expect(state.overrides['btn.save'].value).toBe('New')
    })
  })

  describe('deleteTranslation async actions', () => {
    it('removes an override on fulfilled', () => {
      const stateWithOverride = {
        ...empty,
        overrides: { 'btn.save': { key: 'btn.save', value: 'Opslaan' } },
      }
      const action = {
        type: 'translations/deleteTranslation/fulfilled',
        payload: { key: 'btn.save' },
      }
      const state = reducer(stateWithOverride, action)
      expect(state.overrides['btn.save']).toBeUndefined()
    })
  })

  describe('fetchTranslations thunk (async dispatch)', () => {
    function makeStore() {
      return configureStore({ reducer: { translations: reducer } })
    }

    it('fetches translations with key/value records', async () => {
      mockListFromDBAL.mockResolvedValueOnce([
        { key: 'hello', value: 'Hallo', updatedBy: 'user1' },
        { key: 'bye', value: 'Tschüss' },
        { key: 'novalue' }, // should be skipped
        { value: 'nokey' }, // should be skipped
      ])
      const store = makeStore()
      await store.dispatch(fetchTranslations('de') as any)
      const state = store.getState().translations
      expect(state.status).toBe('success')
      expect(state.locale).toBe('de')
      expect(state.overrides['hello'].value).toBe('Hallo')
      expect(state.overrides['bye'].value).toBe('Tschüss')
      expect(Object.keys(state.overrides)).toHaveLength(2)
    })

    it('handles fetch rejection', async () => {
      mockListFromDBAL.mockRejectedValueOnce(new Error('network error'))
      const store = makeStore()
      await store.dispatch(fetchTranslations('en') as any)
      expect(store.getState().translations.status).toBe('error')
      expect(store.getState().translations.error).toBe('network error')
    })

    it('handles fetch rejection with no message', async () => {
      mockListFromDBAL.mockRejectedValueOnce({})
      const store = makeStore()
      await store.dispatch(fetchTranslations('en') as any)
      expect(store.getState().translations.status).toBe('error')
    })
  })

  describe('upsertTranslation thunk (async dispatch)', () => {
    function makeStore() {
      return configureStore({ reducer: { translations: reducer } })
    }

    it('upserts a translation override', async () => {
      mockSyncToDBAL.mockResolvedValueOnce(undefined)
      const store = makeStore()
      await store.dispatch(upsertTranslation({ locale: 'en', key: 'title', value: 'Title' }) as any)
      expect(store.getState().translations.overrides['title'].value).toBe('Title')
    })

    it('handles upsert rejection', async () => {
      mockSyncToDBAL.mockRejectedValueOnce(new Error('sync failed'))
      const store = makeStore()
      const result = await store.dispatch(upsertTranslation({ locale: 'en', key: 'title', value: 'Title' }) as any)
      expect(result.type).toContain('rejected')
    })
  })

  describe('deleteTranslation thunk (async dispatch)', () => {
    function makeStore() {
      return configureStore({ reducer: { translations: reducer } })
    }

    it('deletes a translation override', async () => {
      mockDeleteFromDBAL.mockResolvedValueOnce(undefined)
      const store = makeStore()
      await store.dispatch(deleteTranslation({ locale: 'en', key: 'title' }) as any)
      expect(store.getState().translations.overrides['title']).toBeUndefined()
    })

    it('handles delete rejection', async () => {
      mockDeleteFromDBAL.mockRejectedValueOnce(new Error('delete failed'))
      const store = makeStore()
      const result = await store.dispatch(deleteTranslation({ locale: 'en', key: 'title' }) as any)
      expect(result.type).toContain('rejected')
    })
  })
})
