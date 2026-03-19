/**
 * Comments Page (Level 1+: User)
 *
 * Mirrors old/src/components/Level2.tsx comments tab
 * Community discussion with post/delete capabilities
 */
'use client'

import { useState } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import {
  Typography,
  Paper,
  Button,
  TextField,
  Avatar,
  Divider,
  Chip,
} from '@/fakemui'

interface Comment {
  id: string
  userId: string
  username: string
  content: string
  createdAt: number
}

function CommentsContent() {
  const auth = useAuthContext()
  const user = auth.user
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'demo_1',
      userId: 'demo',
      username: 'demo',
      content: 'Welcome to MetaBuilder! This is a sample comment.',
      createdAt: Date.now() - 86400000,
    },
  ])

  const handlePost = () => {
    if (newComment.trim() === '') return
    const comment: Comment = {
      id: `comment_${Date.now()}`,
      userId: user?.id ?? 'unknown',
      username: user?.username ?? 'Anonymous',
      content: newComment,
      createdAt: Date.now(),
    }
    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const handleDelete = (id: string) => {
    setComments(prev => prev.filter(c => c.id !== id))
  }

  const myComments = comments.filter(c => c.userId === user?.id)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Comments
      </Typography>

      {/* Post form */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Post a Comment</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Share your thoughts with the community
        </Typography>
        <TextField
          value={newComment}
          onChange={(e) => { setNewComment(e.target.value) }}
          placeholder="Write your comment here..."
          fullWidth
          multiline
          rows={3}
          size="small"
          sx={{ mb: 2 }}
        />
        <Button variant="contained" size="small" onClick={handlePost}>
          Post Comment
        </Button>
      </Paper>

      {/* My comments */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Comments ({myComments.length})
        </Typography>
        {myComments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            You have not posted any comments yet
          </Typography>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {myComments.map(comment => (
              <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="body2">{comment.content}</Typography>
                  <Button variant="text" size="small" color="error" onClick={() => { handleDelete(comment.id) }}>
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

      {/* All comments */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          All Comments ({comments.length})
        </Typography>
        {comments.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No comments yet. Be the first to post!
          </Typography>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map(comment => (
              <Paper key={comment.id} variant="outlined" sx={{ p: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>
                    {comment.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {comment.username}
                  </Typography>
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
