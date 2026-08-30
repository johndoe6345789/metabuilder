import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AddAppForm } from './AddAppForm'

const draft = {
  name: '',
  url: '',
  bgColor: '#222222',
  fgColor: '#ffffff',
  embedMode: 'newtab' as const,
}

describe('AddAppForm', () => {
  it('reports a name change', () => {
    const onDraftChange = vi.fn()
    render(
      <AddAppForm
        draft={draft}
        onDraftChange={onDraftChange}
        busy={false}
        formError={null}
        onAdd={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Plex' },
    })
    expect(onDraftChange).toHaveBeenCalledWith({ ...draft, name: 'Plex' })
  })

  it('shows a form error when given one', () => {
    render(
      <AddAppForm
        draft={draft}
        onDraftChange={vi.fn()}
        busy={false}
        formError="Name and URL are required"
        onAdd={vi.fn()}
      />
    )
    expect(screen.getByText('Name and URL are required')).toBeTruthy()
  })

  it('shows no form error by default', () => {
    render(
      <AddAppForm
        draft={draft}
        onDraftChange={vi.fn()}
        busy={false}
        formError={null}
        onAdd={vi.fn()}
      />
    )
    expect(screen.queryByText('Name and URL are required')).toBeNull()
  })

  it('shows the busy label while adding', () => {
    render(
      <AddAppForm
        draft={draft}
        onDraftChange={vi.fn()}
        busy
        formError={null}
        onAdd={vi.fn()}
      />
    )
    expect(screen.getByText('Adding…')).toBeTruthy()
  })

  it('calls onAdd when the button is clicked', () => {
    const onAdd = vi.fn()
    render(
      <AddAppForm
        draft={draft}
        onDraftChange={vi.fn()}
        busy={false}
        formError={null}
        onAdd={onAdd}
      />
    )
    fireEvent.click(screen.getByText('+ Add'))
    expect(onAdd).toHaveBeenCalledOnce()
  })
})
