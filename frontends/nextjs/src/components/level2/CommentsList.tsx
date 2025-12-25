import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback } from '@/components/ui'
import { Trash } from '@phosphor-icons/react'
import type { Comment, User } from '@/lib/level-types'

interface CommentsListProps {
  comments: Comment[]
  currentUserId: string
  users: User[]
  onDelete: (commentId: string) => void
  variant: 'my' | 'all'
}

export function CommentsList({ comments, currentUserId, users, onDelete, variant }: CommentsListProps) {
  const isMyComments = variant === 'my'
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isMyComments ? `Your Comments (${comments.length})` : `All Comments (${comments.length})`}</CardTitle>
        <CardDescription>
          {isMyComments ? "Comments you've posted" : "Community discussion"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {isMyComments ? "You haven't posted any comments yet" : "No comments yet. Be the first to post!"}
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const commentUser = users?.find(u => u.id === comment.userId)
              return (
                <div key={comment.id} className="border border-border rounded-lg p-4 space-y-2">
                  {!isMyComments && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {commentUser?.username[0].toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {commentUser?.username || 'Unknown User'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-sm flex-1">{comment.content}</p>
                    {isMyComments && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(comment.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>
                  {isMyComments && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
