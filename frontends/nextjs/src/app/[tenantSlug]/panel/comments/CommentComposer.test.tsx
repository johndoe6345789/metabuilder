import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { CommentComposer } from './CommentComposer'

describe('CommentComposer', () => {
  it('renders the heading and the current value', () => {
    render(
      <CommentComposer value="hello" onChange={vi.fn()} onPost={vi.fn()} />
    )
    expect(screen.getByText('Post a Comment')).toBeTruthy()
    expect(
      screen.getByPlaceholderText('Write your comment here...')
    ).toHaveProperty('value', 'hello')
  })

  it('calls onChange when text is typed', () => {
    const onChange = vi.fn()
    render(<CommentComposer value="" onChange={onChange} onPost={vi.fn()} />)
    fireEvent.change(
      screen.getByPlaceholderText('Write your comment here...'),
      { target: { value: 'new text' } }
    )
    expect(onChange).toHaveBeenCalledWith('new text')
  })

  it('disables the post button when the value is blank or whitespace', () => {
    render(<CommentComposer value="   " onChange={vi.fn()} onPost={vi.fn()} />)
    const button = screen.getByText('Post Comment').closest('button')
    expect(button?.disabled).toBe(true)
  })

  it('enables the post button and posts when the value has content', () => {
    const onPost = vi.fn()
    render(
      <CommentComposer value="great post" onChange={vi.fn()} onPost={onPost} />
    )
    const button = screen.getByText('Post Comment').closest('button')
    expect(button?.disabled).toBe(false)
    fireEvent.click(button as HTMLButtonElement)
    expect(onPost).toHaveBeenCalledOnce()
  })
})
