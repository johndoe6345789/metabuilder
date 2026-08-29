'use client'

import { Button, Paper, Typography } from '@/m3'
import type { Comment } from './comment-types'
import s from './page.module.scss'

export interface OwnCommentProps {
  comment: Comment
  onDelete: (id: string) => void
}

/** One of the reader's own comments, with the control to remove it. */
export function OwnComment({ comment, onDelete }: OwnCommentProps) {
  return (
    <Paper variant="outlined">
      <div className={s.commentRow}>
        <Typography variant="body2">{comment.content}</Typography>
        <Button
          variant="text"
          size="small"
          color="error"
          onClick={() => {
            onDelete(comment.id)
          }}
        >
          Delete
        </Button>
      </div>
      <Typography variant="caption" color="text.secondary">
        {new Date(comment.createdAt).toLocaleString()}
      </Typography>
    </Paper>
  )
}
