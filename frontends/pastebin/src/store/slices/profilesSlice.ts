import { createSlice, type Action } from '@reduxjs/toolkit'
import {
  fetchUserProfile,
  updateMyProfile,
  getUsername,
} from './profilesThunks'
import type { UserProfile } from './profilesThunks'

export { fetchUserProfile, updateMyProfile }
export type { UserProfile }

interface ProfilesState {
  byUsername: Record<string, UserProfile>
  loading: boolean
  error: string | null
}

const initialState: ProfilesState = {
  byUsername: {},
  loading: false,
  error: null,
}

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUserProfile.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.byUsername[action.payload.username] = action.payload
        }
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(updateMyProfile.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.loading = false
        const profile = action.payload
        const username = profile.username || getUsername()
        if (username) {
          state.byUsername[username] = profile
        }
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addMatcher(
        (action: Action) => action.type === 'persist/REHYDRATE',
        state => {
          state.loading = false
          state.error = null
        },
      )
  },
})

export default profilesSlice.reducer
