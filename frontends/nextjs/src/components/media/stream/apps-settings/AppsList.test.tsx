import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppsList } from './AppsList'

const apps = [
  {
    id: 'a',
    name: 'plex',
    url: 'https://plex',
    bgColor: '#111',
    fgColor: '#fff',
    embedMode: 'newtab' as const,
  },
  {
    id: 'b',
    name: 'jellyfin',
    url: 'https://jf',
    bgColor: '#222',
    fgColor: '#eee',
    embedMode: 'iframe' as const,
  },
]

describe('AppsList', () => {
  it('shows an empty message with no apps', () => {
    render(
      <AppsList
        apps={[]}
        busy={null}
        onEmbedModeChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('No apps yet — add one below.')).toBeTruthy()
  })

  it('renders one row per app', () => {
    render(
      <AppsList
        apps={apps}
        busy={null}
        onEmbedModeChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('plex')).toBeTruthy()
    expect(screen.getByText('jellyfin')).toBeTruthy()
  })

  it('marks only the busy row disabled', () => {
    render(
      <AppsList
        apps={apps}
        busy="a"
        onEmbedModeChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    const buttons = screen.getAllByText('Remove').map(b => b.closest('button'))
    expect(buttons[0]?.disabled).toBe(true)
    expect(buttons[1]?.disabled).toBe(false)
  })

  it('passes the right app through to onEmbedModeChange', () => {
    const onEmbedModeChange = vi.fn()
    render(
      <AppsList
        apps={apps}
        busy={null}
        onEmbedModeChange={onEmbedModeChange}
        onDelete={vi.fn()}
      />
    )
    fireEvent.change(screen.getAllByRole('combobox')[1], {
      target: { value: 'newtab' },
    })
    expect(onEmbedModeChange).toHaveBeenCalledWith(apps[1], 'newtab')
  })
})
