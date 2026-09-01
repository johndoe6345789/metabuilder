import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import {
  authMod,
  boardMod,
  mockComposer,
  mockSection,
  mockOwnComment,
  mockCommunityComment,
  makeBoard,
} from './comments-content-test-mocks'

vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: authMod.useAuthContext,
}))
vi.mock('./use-comments', () => boardMod)
vi.mock('./CommentComposer', () => ({ CommentComposer: mockComposer }))
vi.mock('./CommentSection', () => ({ CommentSection: mockSection }))
vi.mock('./OwnComment', () => ({ OwnComment: mockOwnComment }))
vi.mock('./CommunityComment', () => ({
  CommunityComment: mockCommunityComment,
}))

import { CommentsContent } from './CommentsContent'

let board: ReturnType<typeof makeBoard>

beforeEach(() => {
  vi.clearAllMocks()
  board = makeBoard()
  authMod.useAuthContext.mockReturnValue({ user: { id: 'u1' } })
  boardMod.useComments.mockReturnValue(board)
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(
    'id-1' as `${string}-${string}-${string}-${string}-${string}`
  )
  vi.spyOn(Date, 'now').mockReturnValue(999)
})

describe('CommentsContent posting', () => {
  it('posts a trimmed draft with id/user/time and clears it', async () => {
    render(<CommentsContent />)
    fireEvent.change(screen.getByTestId('draft'), {
      target: { value: '  hello  ' },
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Post'))
    })
    expect(board.post).toHaveBeenCalledWith({
      id: 'id-1',
      userId: 'u1',
      username: 'Anonymous',
      content: 'hello',
      createdAt: 999,
    })
    expect(screen.getByTestId('draft')).toHaveProperty('value', '')
  })

  it('falls back to unknown/Anonymous when there is no user', async () => {
    authMod.useAuthContext.mockReturnValue({ user: null })
    render(<CommentsContent />)
    fireEvent.change(screen.getByTestId('draft'), {
      target: { value: 'hi' },
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Post'))
    })
    expect(board.post).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'unknown', username: 'Anonymous' })
    )
  })

  it('keeps the draft when the post fails', async () => {
    board.post = vi.fn().mockResolvedValue(false)
    boardMod.useComments.mockReturnValue(board)
    render(<CommentsContent />)
    fireEvent.change(screen.getByTestId('draft'), {
      target: { value: 'hi' },
    })
    await act(async () => {
      fireEvent.click(screen.getByText('Post'))
    })
    expect(screen.getByTestId('draft')).toHaveProperty('value', 'hi')
  })
})
