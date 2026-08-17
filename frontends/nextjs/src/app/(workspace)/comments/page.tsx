'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import { Typography, Paper, Button, TextField, Avatar } from '@/m3'
import s from './page.module.scss'

const DBAL_URL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
// ProfileComment lives under the pastebin package (entities/pastebin/profile_comment.json),
// not core -- the route is /{tenant}/{package}/{Entity}, Entity from the schema's own
// "entity" field (PascalCase), not the filename. This page previously called
// /v1/default/core/profile_comment, which matches no real route at all.
const COMMENTS_URL = `${DBAL_URL}/system/pastebin/ProfileComment`

interface Comment {
  id: string
  userId: string
  username: string
  content: string
  createdAt: number
}

interface DbalComment {
  id: string
  authorId: string
  authorUsername: string
  content: string
  createdAt?: number
}

function CommentsContent() {
  const auth = useAuthContext()
  const user = auth.user
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([])

  useEffect(() => {
    fetch(COMMENTS_URL, {
      credentials: 'include',
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: { data?: DbalComment[] } } | null) => {
        const rows = json?.data?.data
        if (rows != null) {
          setComments(
            rows.map(c => ({
              id: c.id,
              userId: c.authorId,
              username: c.authorUsername,
              content: c.content,
              createdAt: c.createdAt ?? Date.now(),
            }))
          )
        }
      })
      .catch(() => {
        setComments([
          {
            id: 'demo_1',
            userId: 'demo',
            username: 'demo',
            content: 'Welcome to MetaBuilder!',
            createdAt: Date.now() - 86400000,
          },
        ])
      })
  }, [])

  const handlePost = () => {
    if (newComment.trim() === '') return
    const id = crypto.randomUUID()
    const authorId = user?.id ?? 'unknown'
    const authorUsername = user?.username ?? 'Anonymous'
    fetch(COMMENTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id,
        // Posting to the shared community board, not a specific user's
        // wall, so this page has no other profile to target -- own id
        // matches "Your Comments"/"All Comments" already being sitewide,
        // not per-profile, sections below.
        profileUserId: authorId,
        authorId,
        authorUsername,
        content: newComment,
        createdAt: Date.now(),
        tenantId: 'system',
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        setComments(prev => [
          ...prev,
          { id, userId: authorId, username: authorUsername, content: newComment, createdAt: Date.now() },
        ])
        setNewComment('')
      })
      .catch(() => {
        /* noop — optimistic update skipped on error */
      })
  }

  const handleDelete = (id: string) => {
    fetch(`${COMMENTS_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then(() => {
        setComments(prev => prev.filter(c => c.id !== id))
      })
      .catch(() => {
        /* noop */
      })
  }

  const myComments = comments.filter(c => c.userId === user?.id)

  return (
    <div className={s.root}>
      <Typography variant="h4" gutterBottom>
        Comments
      </Typography>

      <Paper>
        <Typography variant="h6" gutterBottom>
          Post a Comment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Share your thoughts with the community
        </Typography>
        <div className={s.postField}>
          <TextField
            value={newComment}
            onChange={e => {
              setNewComment(e.target.value)
            }}
            placeholder="Write your comment here..."
            fullWidth
            multiline
            rows={3}
            size="small"
          />
        </div>
        <Button variant="contained" size="small" onClick={handlePost}>
          Post Comment
        </Button>
      </Paper>

      <Paper>
        <Typography variant="h6" gutterBottom>
          Your Comments ({myComments.length})
        </Typography>
        {myComments.length === 0 ? (
          <div className={s.empty}>
            <Typography variant="body2" color="text.secondary">
              You have not posted any comments yet
            </Typography>
          </div>
        ) : (
          <div className={s.list}>
            {myComments.map(comment => (
              <Paper key={comment.id} variant="outlined">
                <div className={s.commentRow}>
                  <Typography variant="body2">{comment.content}</Typography>
                  <Button
                    variant="text"
                    size="small"
                    color="error"
                    onClick={() => {
                      handleDelete(comment.id)
                    }}
                  >
                    Delete
                  </Button>
                </div>
                <Typography variant="caption" color="text.secondary">
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
              </Paper>
            ))}
          </div>
        )}
      </Paper>

      <Paper>
        <Typography variant="h6" gutterBottom>
          All Comments ({comments.length})
        </Typography>
        {comments.length === 0 ? (
          <div className={s.empty}>
            <Typography variant="body2" color="text.secondary">
              No comments yet. Be the first to post!
            </Typography>
          </div>
        ) : (
          <div className={s.list}>
            {comments.map(comment => (
              <Paper key={comment.id} variant="outlined">
                <div className={s.authorRow}>
                  <Avatar>{comment.username.charAt(0).toUpperCase()}</Avatar>
                  <Typography variant="body2">{comment.username}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </Typography>
                </div>
                <Typography variant="body2">{comment.content}</Typography>
              </Paper>
            ))}
          </div>
        )}
      </Paper>
    </div>
  )
}

export default function CommentsPage() {
  return (
    <LevelGate minLevel={1} levelName="User">
      <CommentsContent />
    </LevelGate>
  )
}
