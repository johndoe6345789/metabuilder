import { useMemo } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { CommentsList } from '../../level2/CommentsList'
import { ChallengePanel } from '../sections/ChallengePanel'
import type { Comment, User } from '@/lib/level-types'

interface CommentsTabContentProps {
  comments: Comment[]
  users: User[]
  currentUserId: string
  newComment: string
  onChangeComment: (value: string) => void
  onPostComment: () => void
  onDeleteComment: (commentId: string) => void
}

export function CommentsTabContent({
  comments,
  users,
  currentUserId,
  newComment,
  onChangeComment,
  onPostComment,
  onDeleteComment,
}: CommentsTabContentProps) {
  const userComments = useMemo(
    () => comments.filter(c => c.userId === currentUserId),
    [comments, currentUserId]
  )

  return (
    <ChallengePanel title="Community" description="Share updates and see what others are building.">
      <Card>
        <CardHeader>
          <CardTitle>Post a Comment</CardTitle>
          <CardDescription>Share your thoughts with the community</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={newComment}
            onChange={e => onChangeComment(e.target.value)}
            placeholder="Write your comment here..."
            rows={4}
          />
          <Button onClick={onPostComment}>Post Comment</Button>
        </CardContent>
      </Card>

      <CommentsList
        comments={userComments}
        currentUserId={currentUserId}
        users={users}
        onDelete={onDeleteComment}
        variant="my"
      />

      <CommentsList
        comments={comments}
        currentUserId={currentUserId}
        users={users}
        onDelete={onDeleteComment}
        variant="all"
      />
    </ChallengePanel>
  )
}
