'use client'

import { Avatar, Button, Typography } from '@/m3'
import type { ProfileSummary } from './profile-summary'
import s from './page.module.scss'

export interface ProfileHeroProps {
  summary: ProfileSummary
  levelColor: string
  editing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
}

/** Name, tier and the edit controls that act on the form below. */
export function ProfileHero({
  summary,
  levelColor,
  editing,
  onEdit,
  onCancel,
  onSave,
}: ProfileHeroProps) {
  return (
    <header className={s.hero}>
      <div className={s.identity}>
        <Avatar className={s.avatar} style={{ backgroundColor: levelColor }}>
          {summary.initial}
        </Avatar>
        <div className={s.heroCopy}>
          <div className={s.kicker}>Profile</div>
          <Typography variant="h4" className={s.title}>
            {summary.username}
          </Typography>
          <div className={s.metaRow}>
            <span
              className={s.levelPill}
              style={{ borderColor: levelColor, color: levelColor }}
            >
              Level {summary.roleLevel}
            </span>
            <span>{summary.role} account</span>
            <span>{summary.email || 'No email on file'}</span>
          </div>
        </div>
      </div>

      <div className={s.heroActions}>
        {!editing ? (
          <Button variant="contained" size="small" onClick={onEdit}>
            Edit Profile
          </Button>
        ) : (
          <>
            <Button variant="outlined" size="small" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="contained" size="small" onClick={onSave}>
              Save changes
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
