// Shared mock state + fixtures for CommentsContent's split test files.
// Kept as .ts (no JSX) so it falls outside the 80-line .tsx guardrail.
import { createElement } from 'react'
import { vi } from 'vitest'
import type { Comment } from './comment-types'

export const authMod = { useAuthContext: vi.fn() }
export const boardMod = { useComments: vi.fn() }

interface ComposerProps {
  value: string
  onChange: (v: string) => void
  onPost: () => void
}
export function mockComposer(p: ComposerProps) {
  return createElement(
    'div',
    null,
    createElement('input', {
      'data-testid': 'draft',
      value: p.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        p.onChange(e.target.value)
      },
    }),
    createElement('button', { onClick: p.onPost }, 'Post')
  )
}

interface SectionProps {
  title: string
  comments: Comment[]
  emptyMessage: string
  children: (c: Comment) => React.ReactNode
}
export function mockSection(p: SectionProps) {
  return createElement(
    'div',
    { 'data-testid': `section-${p.title}` },
    p.comments.length === 0
      ? p.emptyMessage
      : p.comments.map(c => createElement('div', { key: c.id }, p.children(c)))
  )
}

export function mockOwnComment(p: {
  comment: Comment
  onDelete: (id: string) => void
}) {
  return createElement(
    'button',
    {
      'data-testid': `own-${p.comment.id}`,
      onClick: () => {
        p.onDelete(p.comment.id)
      },
    },
    p.comment.content
  )
}

export function mockCommunityComment(p: { comment: Comment }) {
  return createElement(
    'div',
    { 'data-testid': `community-${p.comment.id}` },
    p.comment.content
  )
}

export const c = (id: string, userId: string): Comment => ({
  id,
  userId,
  username: `user-${userId}`,
  content: `content-${id}`,
  createdAt: 1,
})

export const makeBoard = () => ({
  comments: [c('a', 'u1'), c('b', 'u2')] as Comment[],
  status: 'ready' as 'ready' | 'loading' | 'unreachable',
  post: vi.fn().mockResolvedValue(true),
  remove: vi.fn().mockResolvedValue(true),
})
