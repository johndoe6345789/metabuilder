import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CommunityComment } from './CommunityComment'
import type { Comment } from './comment-types'

const comment: Comment = {
  id: 'c1',
  userId: 'u1',
  username: 'alice',
  content: 'Great snippet!',
  createdAt: 1700000000000,
}

describe('CommunityComment', () => {
  it('renders the username and content', () => {
    render(<CommunityComment comment={comment} />)
    expect(screen.getByText('alice')).toBeTruthy()
    expect(screen.getByText('Great snippet!')).toBeTruthy()
  })

  it('renders the uppercased first letter of the username as the avatar', () => {
    render(<CommunityComment comment={comment} />)
    expect(screen.getByText('A')).toBeTruthy()
  })

  it('renders the creation date formatted with toLocaleDateString', () => {
    render(<CommunityComment comment={comment} />)
    expect(
      screen.getByText(new Date(comment.createdAt).toLocaleDateString())
    ).toBeTruthy()
  })
})
