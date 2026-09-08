'use client'

import { useCallback, useEffect, useState } from 'react'
import { deleteComment, fetchComments, postComment } from './comment-api'
import type { Comment } from './comment-types'

export type BoardStatus = 'loading' | 'ready' | 'unreachable'

export interface CommentsBoard {
  comments: Comment[]
  status: BoardStatus
  post: (comment: Comment) => Promise<boolean>
  remove: (id: string) => Promise<boolean>
}

/**
 * The board's rows and the two writes that change them.
 *
 * A failed load reports `unreachable` rather than substituting invented
 * rows: this page used to seed a "Welcome to MetaBuilder!" comment
 * whenever the data layer was down, which reads as real content posted by
 * a real account.
 */
export function useComments(tenant: string): CommentsBoard {
  const [comments, setComments] = useState<Comment[]>([])
  const [status, setStatus] = useState<BoardStatus>('loading')

  useEffect(() => {
    let live = true
    void fetchComments(tenant).then(rows => {
      if (!live) return
      setComments(rows ?? [])
      setStatus(rows === null ? 'unreachable' : 'ready')
    })
    return () => {
      live = false
    }
  }, [tenant])

  const post = useCallback(async (comment: Comment): Promise<boolean> => {
    const ok = await postComment(tenant, comment)
    if (ok) setComments(prev => [...prev, comment])
    return ok
  }, [tenant])

  const remove = useCallback(async (id: string): Promise<boolean> => {
    const ok = await deleteComment(tenant, id)
    if (ok) setComments(prev => prev.filter(c => c.id !== id))
    return ok
  }, [tenant])

  return { comments, status, post, remove }
}
