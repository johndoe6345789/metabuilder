import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { DeleteRowButton } from './DeleteRowButton'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('DeleteRowButton', () => {
  it('deletes a leaf immediately, without asking', () => {
    const onDelete = vi.fn()
    const confirmSpy = vi.spyOn(window, 'confirm')
    render(
      <DeleteRowButton id="p2" name="Paragraph" hasChildren={false} onDelete={onDelete} />
    )

    fireEvent.click(screen.getByText('✕'))

    expect(confirmSpy).not.toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalledWith('p2')
  })

  it('asks for confirmation before deleting a node with children', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(
      <DeleteRowButton id="box" name="Section" hasChildren onDelete={onDelete} />
    )

    fireEvent.click(screen.getByText('✕'))

    expect(window.confirm).toHaveBeenCalledWith(
      'Delete this Section and everything inside it?'
    )
    expect(onDelete).toHaveBeenCalledWith('box')
  })

  it('keeps the node when the confirmation is declined', () => {
    const onDelete = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(
      <DeleteRowButton id="box" name="Section" hasChildren onDelete={onDelete} />
    )

    fireEvent.click(screen.getByText('✕'))

    expect(onDelete).not.toHaveBeenCalled()
  })
})
