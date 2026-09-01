import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { OwnComment } from './OwnComment'
import type { Comment } from './comment-types'

const comment: Comment = {
  id: 'c1',
  userId: 'u1',
  username: 'alex',
  content: 'This is my comment',
  createdAt: 1700000000000,
}

describe('OwnComment', () => {
  it('renders the comment content', () => {
    render(<OwnComment comment={comment} onDelete={vi.fn()} />)
    expect(screen.getByText('This is my comment')).toBeTruthy()
  })

  it('renders the formatted creation date', () => {
    render(<OwnComment comment={comment} onDelete={vi.fn()} />)
    expect(
      screen.getByText(new Date(comment.createdAt).toLocaleString())
    ).toBeTruthy()
  })

  it('calls onDelete with the comment id when Delete is clicked', () => {
    const onDelete = vi.fn()
    render(<OwnComment comment={comment} onDelete={onDelete} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledWith('c1')
  })
})
