"use client"

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui'
import { Stack, Typography } from '@/components/ui'
import { toast } from 'sonner'
import { Database } from '@/lib/database'
import type { Comment, User } from '@/lib/level-types'
import { AppHeader } from '@/components/shared/AppHeader'

const FLAGGED_TERMS = ['spam', 'error', 'abuse', 'illegal', 'urgent', 'offensive']

export interface ModeratorPanelProps {
  user: User
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function ModeratorPanel({ user, onLogout, onNavigate }: ModeratorPanelProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    setIsLoading(true)

    Database.getComments()
      .then((latest) => {
        if (active) {
          setComments(latest)
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [])

  const flaggedComments = useMemo(() => {
    return comments.filter((comment) => {
      if (resolvedIds.includes(comment.id)) {
        return false
      }
      const content = comment.content.toLowerCase()
      return FLAGGED_TERMS.some((term) => content.includes(term))
    })
  }, [comments, resolvedIds])

  const handleResolve = (commentId: string) => {
    if (resolvedIds.includes(commentId)) {
      return
    }
    setResolvedIds((current) => [...current, commentId])
    toast.success('Flag resolved and archived from the queue')
  }

  const highlightLabel = (term: string) => term.charAt(0).toUpperCase() + term.slice(1)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Moderator Desk"
        username={user.username}
        showBadge
        showAvatar
        variant="admin"
        onNavigateHome={() => onNavigate(1)}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="space-y-2">
          <Typography variant="h4">Moderation queue</Typography>
          <Typography color="text.secondary">
            Keep the community healthy by resolving flags, reviewing reports, and guiding the tone.
          </Typography>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Flagged content</CardTitle>
              <CardDescription>Automated signal based on keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <Typography variant="h3">{flaggedComments.length}</Typography>
              <Typography color="text.secondary" className="mt-2">
                Pending items in the moderation queue
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resolved this session</CardTitle>
            </CardHeader>
            <CardContent>
              <Typography variant="h3">{resolvedIds.length}</Typography>
              <Typography color="text.secondary" className="mt-2">
                Items you flagged as handled
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community signals</CardTitle>
            </CardHeader>
            <CardContent>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {FLAGGED_TERMS.map((term) => (
                  <Badge key={term}>{highlightLabel(term)}</Badge>
                ))}
              </Stack>
              <Typography color="text.secondary" className="mt-2">
                Track the keywords that pulled items into the queue
              </Typography>
            </CardContent>
          </Card>
        </div>

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
                    const matches = FLAGGED_TERMS.filter((term) =>
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
                          <Button size="sm" variant="ghost" onClick={() => handleResolve(comment.id)}>
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
      </div>
    </div>
  )
}
