import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { selectCurrentUser, selectUserProfile } from '@/store/selectors'
import {
  updateMyProfile,
  fetchUserProfile,
} from '@/store/slices/profilesSlice'

export function useProfileSettings() {
  const user = useAppSelector(selectCurrentUser)
  const profile = useAppSelector(state =>
    user ? selectUserProfile(state, user.username) : null,
  )
  const dispatch = useAppDispatch()
  const [bio, setBio] = useState('')
  const [bioLoaded, setBioLoaded] = useState(false)
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user?.username) dispatch(fetchUserProfile(user.username))
  }, [user?.username, dispatch])

  useEffect(() => {
    if (profile?.bio !== undefined && !bioLoaded) {
      setBio(profile.bio)
      setBioLoaded(true)
    }
  }, [profile, bioLoaded])

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(updateMyProfile(bio)).unwrap()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* error handled by slice */ }
    setSaving(false)
  }

  return {
    user,
    bio,
    preview,
    saving,
    saved,
    setBio,
    setPreview,
    handleSave,
  }
}
