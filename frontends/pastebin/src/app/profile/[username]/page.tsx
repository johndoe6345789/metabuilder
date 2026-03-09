'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { UserAvatar } from '@/components/layout/UserAvatar'
import { MarkdownRenderer } from '@/components/error/MarkdownRenderer'
import { ProfileComments } from '@/components/features/comments/ProfileComments'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchUserProfile } from '@/store/slices/profilesSlice'
import { selectUserProfile, selectProfilesLoading } from '@/store/selectors'
import styles from './profile-page.module.scss'

function joinedDate(ms: number): string {
  if (!ms) return 'Unknown'
  return new Date(ms).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const dispatch = useAppDispatch()
  const user = useAppSelector(state => selectUserProfile(state, username))
  const loading = useAppSelector(selectProfilesLoading)

  useEffect(() => {
    if (username) dispatch(fetchUserProfile(username))
  }, [username, dispatch])

  if (loading && !user) {
    return <div className={styles.loading}>Loading profile…</div>
  }
  if (!loading && !user) {
    return <div className={styles.notFound}>User <strong>@{username}</strong> not found.</div>
  }
  if (!user) return null

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <UserAvatar username={user.username} size="lg" />
        <div className={styles.info}>
          <h1 className={styles.username}>@{user.username}</h1>
          <p className={styles.joined}>Joined {joinedDate(user.createdAt)}</p>
        </div>
      </div>

      {user.bio && (
        <div className={styles.bio}>
          <MarkdownRenderer content={user.bio} animate={false} />
        </div>
      )}

      <ProfileComments profileUserId={user.id} />
    </div>
  )
}
