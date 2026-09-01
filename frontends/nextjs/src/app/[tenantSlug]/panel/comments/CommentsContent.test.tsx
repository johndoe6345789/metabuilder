import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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
})

describe('CommentsContent listing', () => {
  it('filters "Your Comments" to the signed-in user', () => {
    render(<CommentsContent />)
    const mine = screen.getByTestId('section-Your Comments')
    expect(mine.textContent).toContain('content-a')
    expect(mine.textContent).not.toContain('content-b')
  })

  it('lists every comment under "All Comments"', () => {
    render(<CommentsContent />)
    const all = screen.getByTestId('section-All Comments')
    expect(all.textContent).toContain('content-a')
    expect(all.textContent).toContain('content-b')
  })

  it.each([
    ['unreachable' as const, true],
    ['ready' as const, false],
  ])('shows the unreachable notice only when status is %s', (status, shown) => {
    boardMod.useComments.mockReturnValue({ ...board, status })
    render(<CommentsContent />)
    const found = screen.queryByText(/comment board is unreachable/) !== null
    expect(found).toBe(shown)
  })

  it('wires OwnComment delete clicks to board.remove', () => {
    render(<CommentsContent />)
    fireEvent.click(screen.getByTestId('own-a'))
    expect(board.remove).toHaveBeenCalledWith('a')
  })

  it('does not post an empty/whitespace draft', () => {
    render(<CommentsContent />)
    fireEvent.click(screen.getByText('Post'))
    expect(board.post).not.toHaveBeenCalled()
  })
})
