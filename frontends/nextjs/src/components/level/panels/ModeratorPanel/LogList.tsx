import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Stack } from '@/components/ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Typography } from '@/components/ui'
import type { Comment } from '@/lib/level-types'

interface ModeratorLogListProps {
  flaggedComments: Comment[]
  flaggedTerms: string[]
  isLoading: boolean
  onNavigate: (level: number) => void
  onResolve: (commentId: string) => void
}

export function ModeratorLogList({
  flaggedComments,
  flaggedTerms,
  isLoading,
  onNavigate,
  onResolve,
}: ModeratorLogListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Flagged comments</CardTitle>
            <CardDescription>A curated view of the comments that triggered a signal</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate(2)}>
            Go to user dashboard
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Typography color="text.secondary">Loading flagged comments…</Typography>
        ) : flaggedComments.length === 0 ? (
          <Typography color="text.secondary">
            No flagged comments at the moment. Enjoy the calm.
          </Typography>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Matched terms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flaggedComments.map((comment) => {
                const matches = flaggedTerms.filter((term) =>
                  comment.content.toLowerCase().includes(term)
                )

                return (
                  <TableRow key={comment.id}>
                    <TableCell className="font-mono text-sm">{comment.userId}</TableCell>
                    <TableCell>{comment.content}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {matches.map((match) => (
                          <Badge key={`${comment.id}-${match}`} variant="outline">
                            {match}
                          </Badge>
                        ))}
                      </Stack>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" onClick={() => onResolve(comment.id)}>
                        Mark safe
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
