'use client'

import { TextField, Typography } from '@/m3'
import { SaveStatusMessage } from './SaveStatusMessage'
import type { SaveStatus } from './use-profile-form'
import s from './page.module.scss'

export interface ProfileFieldsProps {
  username: string
  email: string
  bio: string
  editing: boolean
  status: SaveStatus
  onEmailChange: (value: string) => void
  onBioChange: (value: string) => void
}

/** The editable half of the profile. */
export function ProfileFields({
  username,
  email,
  bio,
  editing,
  status,
  onEmailChange,
  onBioChange,
}: ProfileFieldsProps) {
  return (
    <section className={s.panel}>
      <div className={s.cardHeader}>
        <div>
          <Typography variant="h6">Profile information</Typography>
          <p>Keep the public details crisp and recognizable.</p>
        </div>
      </div>

      <SaveStatusMessage status={status} />

      <div className={s.fields}>
        <TextField
          label="Username"
          value={username}
          disabled
          fullWidth
          size="small"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => {
            onEmailChange(e.target.value)
          }}
          disabled={!editing}
          fullWidth
          size="small"
        />
        <TextField
          label="Bio"
          value={bio}
          onChange={e => {
            onBioChange(e.target.value)
          }}
          disabled={!editing}
          fullWidth
          multiline
          rows={4}
          size="small"
          placeholder="Tell us about yourself..."
        />
      </div>
    </section>
  )
}
