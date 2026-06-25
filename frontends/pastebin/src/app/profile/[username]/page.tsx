'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MaterialIcon } from '@metabuilder/components/m3'
import { PageLayout } from '@/app/PageLayout'
import { UserAvatar } from '@/components/layout/UserAvatar'
import { MarkdownRenderer } from '@/components/error/MarkdownRenderer'
import { ProfileComments } from '@/components/features/comments/ProfileComments'
import { useProfilePage } from './hooks/useProfilePage'
import styles from './profile-page.module.scss'

function joinedDate(ms: number): string {
  if (!ms) return 'Unknown'
  return new Date(ms).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  })
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const { user, loading } = useProfilePage(username)

  if (loading && !user) {
    return (
      <PageLayout>
        <div className={styles.loading}>Loading profile…</div>
      </PageLayout>
    )
  }
  if (!loading && !user) {
    return (
      <PageLayout>
        <div className={styles.notFound}>
          User <strong>@{username}</strong> not found.
        </div>
      </PageLayout>
    )
  }
  if (!user) return null

  return (
    <PageLayout>
      <div className={styles.page}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <button
            className={styles.backBtn}
            onClick={() => router.push('/')}
            aria-label="Back to snippets"
          >
            <MaterialIcon name="arrow_back" size={14} />
            <span>Back</span>
          </button>
          <ol className={styles.crumbList}>
            <li>
              <Link href="/" className={styles.crumbLink}>
                My Snippets
              </Link>
            </li>
            <li aria-hidden="true" className={styles.crumbSep}>
              /
            </li>
            <li aria-current="page" className={styles.crumbCurrent}>
              @{user.username}
            </li>
          </ol>
        </nav>

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
    </PageLayout>
  )
}
