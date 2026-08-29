'use client'

import { Avatar, Paper, Typography } from '@/m3'
import type { Comment } from './comment-types'
import s from './page.module.scss'

/** Somebody's comment on the shared board. */
export function CommunityComment({ comment }: { comment: Comment }) {
  return (
    <Paper variant="outlined">
      <div className={s.authorRow}>
        <Avatar>{comment.username.charAt(0).toUpperCase()}</Avatar>
        <Typography variant="body2">{comment.username}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(comment.createdAt).toLocaleDateString()}
        </Typography>
      </div>
      <Typography variant="body2">{comment.content}</Typography>
    </Paper>
  )
}
