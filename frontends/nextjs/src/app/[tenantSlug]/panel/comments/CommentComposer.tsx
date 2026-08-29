'use client'

import { Button, Paper, TextField, Typography } from '@/m3'
import s from './page.module.scss'

export interface CommentComposerProps {
  value: string
  onChange: (value: string) => void
  onPost: () => void
}

/** Write a comment and put it on the board. */
export function CommentComposer({
  value,
  onChange,
  onPost,
}: CommentComposerProps) {
  return (
    <Paper>
      <Typography variant="h6" gutterBottom>
        Post a Comment
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Share your thoughts with the community
      </Typography>
      <div className={s.postField}>
        <TextField
          value={value}
          onChange={e => {
            onChange(e.target.value)
          }}
          placeholder="Write your comment here..."
          fullWidth
          multiline
          rows={3}
          size="small"
        />
      </div>
      <Button
        variant="contained"
        size="small"
        onClick={onPost}
        disabled={value.trim() === ''}
      >
        Post Comment
      </Button>
    </Paper>
  )
}
