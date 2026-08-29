'use client'

import { useState } from 'react'
import { Typography } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { CommentComposer } from './CommentComposer'
import { CommentSection } from './CommentSection'
import { CommunityComment } from './CommunityComment'
import { OwnComment } from './OwnComment'
import { useComments } from './use-comments'
import s from './page.module.scss'

/** The shared community board. */
export function CommentsContent() {
  const user = useAuthContext().user
  const board = useComments()
  const [draft, setDraft] = useState('')

  const handlePost = (): void => {
    const content = draft.trim()
    if (content === '') return
    void board
      .post({
        id: crypto.randomUUID(),
        userId: user?.id ?? 'unknown',
        username: user?.username ?? 'Anonymous',
        content,
        createdAt: Date.now(),
      })
      .then(posted => {
        if (posted) setDraft('')
      })
  }

  const mine = board.comments.filter(c => c.userId === user?.id)

  return (
    <div className={s.root}>
      <Typography variant="h4" gutterBottom>
        Comments
      </Typography>

      {board.status === 'unreachable' && (
        <Typography variant="body2" color="error">
          The comment board is unreachable right now. Nothing below is
          missing — there is simply nothing to show until it is back.
        </Typography>
      )}

      <CommentComposer value={draft} onChange={setDraft} onPost={handlePost} />

      <CommentSection
        title="Your Comments"
        comments={mine}
        emptyMessage="You have not posted any comments yet"
      >
        {comment => (
          <OwnComment
            key={comment.id}
            comment={comment}
            onDelete={id => void board.remove(id)}
          />
        )}
      </CommentSection>

      <CommentSection
        title="All Comments"
        comments={board.comments}
        emptyMessage="No comments yet. Be the first to post!"
      >
        {comment => <CommunityComment key={comment.id} comment={comment} />}
      </CommentSection>
    </div>
  )
}
