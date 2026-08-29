'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { getRoleLevel } from '@/lib/constants'
import { getLevelColor } from '@/lib/packages/navigation'
import { ProfileFields } from './ProfileFields'
import { ProfileHero } from './ProfileHero'
import { ProfileSecurity } from './ProfileSecurity'
import { ProfileStats } from './ProfileStats'
import { summarise } from './profile-summary'
import { useProfileForm } from './use-profile-form'
import s from './page.module.scss'

/** A user's own profile: read it, edit it, save it. */
export function ProfileContent() {
  const user = useAuthContext().user
  const summary = summarise(user ?? null, getRoleLevel(user?.role ?? 'user'))
  const form = useProfileForm({
    userId: user?.id ?? null,
    email: summary.email,
    bio: user?.bio ?? '',
  })

  return (
    <div className={s.root}>
      <ProfileHero
        summary={summary}
        levelColor={getLevelColor(summary.roleLevel)}
        editing={form.editing}
        onEdit={form.startEditing}
        onCancel={form.cancel}
        onSave={() => void form.save()}
      />
      <ProfileStats summary={summary} />
      <div className={s.grid}>
        <ProfileFields
          username={summary.username}
          email={form.email}
          bio={form.bio}
          editing={form.editing}
          status={form.status}
          onEmailChange={form.setEmail}
          onBioChange={form.setBio}
        />
        <ProfileSecurity />
      </div>
    </div>
  )
}
