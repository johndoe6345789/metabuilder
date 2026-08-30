import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppsSettingsModal } from './AppsSettingsModal'

const app = {
  id: 'a',
  name: 'plex',
  url: 'https://plex',
  bgColor: '#111',
  fgColor: '#fff',
  embedMode: 'newtab' as const,
}

describe('AppsSettingsModal actions', () => {
  it('creates a new app end to end', () => {
    const onCreate = vi.fn(async () => {})
    render(
      <AppsSettingsModal
        apps={[]}
        onClose={vi.fn()}
        onCreate={onCreate}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'Plex' },
    })
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://plex.tv' },
    })
    fireEvent.click(screen.getByText('+ Add'))
    expect(onCreate).toHaveBeenCalledOnce()
  })

  it('deletes an app end to end', () => {
    const onDelete = vi.fn(async () => {})
    render(
      <AppsSettingsModal
        apps={[app]}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={onDelete}
      />
    )
    fireEvent.click(screen.getByText('Remove'))
    expect(onDelete).toHaveBeenCalledWith('a')
  })
})
