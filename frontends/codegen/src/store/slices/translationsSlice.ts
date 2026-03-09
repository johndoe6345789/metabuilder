/**
 * Translations Redux Slice
 *
 * Manages i18n state: current locale, DBAL translation overrides, and sync status.
 *
 * Data flow: Seed → DBAL → Redux Persist → UI → Search + String translations
 *
 * State shape:
 *   locale     — current BCP 47 locale code (e.g., 'en', 'nl')
 *   overrides  — DBAL translation overrides keyed by translation key
 *   status     — 'idle' | 'loading' | 'success' | 'error'
 *   error      — human-readable error message
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { listFromDBAL, syncToDBAL, deleteFromDBAL } from '@/store/middleware/dbalSync'
import { defaultLocale } from '@metabuilder/translations'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TranslationOverride {
  key: string
  value: string
  updatedBy?: string
}

interface TranslationsState {
  locale: string
  overrides: Record<string, TranslationOverride>
  status: 'idle' | 'loading' | 'success' | 'error'
  error: string | null
}

const initialState: TranslationsState = {
  locale: defaultLocale,
  overrides: {},
  status: 'idle',
  error: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all translation overrides for the current locale from DBAL */
export const fetchTranslations = createAsyncThunk(
  'translations/fetchTranslations',
  async (locale: string, { rejectWithValue }) => {
    try {
      const records = await listFromDBAL('translations', { locale })
      const overrides: Record<string, TranslationOverride> = {}
      for (const record of records) {
        if (record.key && record.value) {
          overrides[record.key] = {
            key: record.key,
            value: record.value,
            updatedBy: record.updatedBy,
          }
        }
      }
      return { locale, overrides }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch translations')
    }
  }
)

/** Upsert a single translation override to DBAL */
export const upsertTranslation = createAsyncThunk(
  'translations/upsertTranslation',
  async (
    { locale, key, value }: { locale: string; key: string; value: string },
    { rejectWithValue }
  ) => {
    try {
      const id = `${locale}:${key}`
      await syncToDBAL('translations', id, { locale, key, value })
      return { key, value }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save translation')
    }
  }
)

/** Delete a translation override from DBAL (reverts to static fallback) */
export const deleteTranslation = createAsyncThunk(
  'translations/deleteTranslation',
  async (
    { locale, key }: { locale: string; key: string },
    { rejectWithValue }
  ) => {
    try {
      const id = `${locale}:${key}`
      await deleteFromDBAL('translations', id)
      return { key }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete translation')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const translationsSlice = createSlice({
  name: 'translations',
  initialState,
  reducers: {
    setLocale: (state, action: PayloadAction<string>) => {
      state.locale = action.payload
      state.overrides = {}
      state.status = 'idle'
    },
    clearTranslationOverrides: (state) => {
      state.overrides = {}
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch translations ─────────────────────────────────
      .addCase(fetchTranslations.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTranslations.fulfilled, (state, action) => {
        state.status = 'success'
        state.locale = action.payload.locale
        state.overrides = action.payload.overrides
      })
      .addCase(fetchTranslations.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })

      // ── Upsert translation ─────────────────────────────────
      .addCase(upsertTranslation.fulfilled, (state, action) => {
        const { key, value } = action.payload
        state.overrides[key] = { key, value }
      })

      // ── Delete translation ─────────────────────────────────
      .addCase(deleteTranslation.fulfilled, (state, action) => {
        delete state.overrides[action.payload.key]
      })
  },
})

export const { setLocale, clearTranslationOverrides } = translationsSlice.actions
export default translationsSlice.reducer
