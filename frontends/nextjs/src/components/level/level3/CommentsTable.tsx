import { useMemo } from 'react'

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Trash } from '@/fakemui/icons'
import type { Comment, User } from '@/lib/level-types'

import { ChallengePanel } from '../sections/ChallengePanel'

interface CommentsTableProps {
  comments: Comment[]
  users: User[]
  searchTerm: string
  onDeleteComment: (commentId: string) => void
}

export function CommentsTable({
  comments,
  users,
  searchTerm,
  onDeleteComment,
}: CommentsTableProps) {
  const filteredComments = useMemo(
    () => comments.filter(c => c.content.toLowerCase().includes(searchTerm.toLowerCase())),
    [comments, searchTerm]
  )

  return (
    <ChallengePanel title="Comments" description="Moderate community feedback">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No comments found
              </TableCell>
            </TableRow>
          ) : (
            filteredComments.map(c => {
              const commentUser = users.find(u => u.id === c.userId)
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {commentUser?.username || 'Unknown'}
                  </TableCell>
                  <TableCell className="max-w-md truncate">{c.content}</TableCell>
                  <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onDeleteComment(c.id)}>
                      <Trash size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </ChallengePanel>
  )
}
