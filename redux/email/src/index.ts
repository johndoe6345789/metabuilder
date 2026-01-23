/**
 * @metabuilder/redux-email
 *
 * Redux state management package for email client functionality.
 * Provides slices for email lists, details, composition, and filtering.
 *
 * Usage:
 * ```typescript
 * import { configureStore } from '@reduxjs/toolkit'
 * import {
 *   emailListSlice,
 *   emailDetailSlice,
 *   emailComposeSlice,
 *   emailFiltersSlice
 * } from '@metabuilder/redux-email'
 *
 * const store = configureStore({
 *   reducer: {
 *     emailList: emailListSlice.reducer,
 *     emailDetail: emailDetailSlice.reducer,
 *     emailCompose: emailComposeSlice.reducer,
 *     emailFilters: emailFiltersSlice.reducer,
 *   }
 * })
 * ```
 */

// Re-export all slices and their types
export * from './slices'
