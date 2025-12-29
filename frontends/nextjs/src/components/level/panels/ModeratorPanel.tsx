'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { AppHeader } from '@/components/shared/AppHeader'
import { Database } from '@/lib/database'
import type { Comment, User } from '@/lib/level-types'
import { ModeratorActions } from './ModeratorPanel/Actions'
import { ModeratorHeader } from './ModeratorPanel/Header'
import { ModeratorLogList } from './ModeratorPanel/LogList'

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
      .then(latest => {
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
    return comments.filter(comment => {
      if (resolvedIds.includes(comment.id)) {
        return false
      }
      const content = comment.content.toLowerCase()
      return FLAGGED_TERMS.some(term => content.includes(term))
    })
  }, [comments, resolvedIds])

  const handleResolve = (commentId: string) => {
    if (resolvedIds.includes(commentId)) {
      return
    }
    setResolvedIds(current => [...current, commentId])
    toast.success('Flag resolved and archived from the queue')
  }

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
        <ModeratorHeader />
        <ModeratorActions
          flaggedCount={flaggedComments.length}
          resolvedCount={resolvedIds.length}
          flaggedTerms={FLAGGED_TERMS}
        />
        <ModeratorLogList
          flaggedComments={flaggedComments}
          flaggedTerms={FLAGGED_TERMS}
          isLoading={isLoading}
          onNavigate={onNavigate}
          onResolve={handleResolve}
        />
      </div>
    </div>
  )
}
