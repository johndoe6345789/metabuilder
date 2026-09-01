import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CommentSection } from './CommentSection'
import type { Comment } from './comment-types'

const comments: Comment[] = [
  { id: 'c1', userId: 'u1', username: 'alice', content: 'first', createdAt: 1 },
  { id: 'c2', userId: 'u2', username: 'bob', content: 'second', createdAt: 2 },
]

describe('CommentSection', () => {
  it('shows the title with the comment count', () => {
    render(
      <CommentSection
        title="Community"
        comments={comments}
        emptyMessage="Nothing yet"
        children={c => <div key={c.id}>{c.content}</div>}
      />
    )
    expect(screen.getByText('Community (2)')).toBeTruthy()
  })

  it('renders every comment via the children render prop', () => {
    render(
      <CommentSection
        title="Community"
        comments={comments}
        emptyMessage="Nothing yet"
        children={c => <div key={c.id}>{c.content}</div>}
      />
    )
    expect(screen.getByText('first')).toBeTruthy()
    expect(screen.getByText('second')).toBeTruthy()
  })

  it('shows the empty message and no list when there are no comments', () => {
    render(
      <CommentSection
        title="Community"
        comments={[]}
        emptyMessage="Nothing yet"
        children={c => <div key={c.id}>{c.content}</div>}
      />
    )
    expect(screen.getByText('Community (0)')).toBeTruthy()
    expect(screen.getByText('Nothing yet')).toBeTruthy()
  })
})
