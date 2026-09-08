'use client'

import Link from 'next/link'
import { Button, Chip, Paper, Typography } from '@/m3'
import { tenantPath } from '@/lib/tenant/workspace-paths'
import type { Submission } from './submission-row'
import { HANDLED } from './use-submissions'
import s from './SubmissionsTab.module.scss'

export interface SubmissionCardProps {
  submission: Submission
  tenant: string
  onMark: (row: Submission, handled: boolean) => void
}

const when = (at: number | null): string =>
  at === null ? 'No date recorded' : new Date(at).toLocaleString()

/** One message: who sent what, from which page, and whether it is done. */
export function SubmissionCard({
  submission,
  tenant,
  onMark,
}: SubmissionCardProps) {
  const handled = submission.status === HANDLED
  const answers = Object.entries(submission.data)

  return (
    <Paper className={`${s.card} ${handled ? s.handled : ''}`}>
      <div className={s.cardHead}>
        <Chip label={submission.formName} size="small" />
        {/* next/link applies the basePath; a bare <a> would 404. */}
        <Link href={tenantPath(tenant, submission.path)}>
          {submission.path}
        </Link>
        <Typography variant="caption" color="text.secondary">
          {when(submission.receivedAt)}
        </Typography>
        <span className={s.spacer} />
        {handled && <Chip label="Handled" size="small" color="success" />}
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            onMark(submission, !handled)
          }}
        >
          {handled ? 'Mark unread' : 'Mark handled'}
        </Button>
      </div>

      {answers.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          This message carried no fields.
        </Typography>
      ) : (
        <dl className={s.answers}>
          {answers.map(([field, value]) => (
            <div key={field} style={{ display: 'contents' }}>
              <dt>{field}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Paper>
  )
}
