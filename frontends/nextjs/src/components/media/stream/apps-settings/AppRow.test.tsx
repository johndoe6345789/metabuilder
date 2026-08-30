import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { AppRow } from './AppRow'

const app = {
  id: 'a',
  name: 'plex',
  url: 'https://plex',
  bgColor: '#111',
  fgColor: '#fff',
  embedMode: 'newtab' as const,
}

describe('AppRow', () => {
  it('shows the app name and url', () => {
    render(
      <AppRow
        app={app}
        busy={false}
        onEmbedModeChange={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('plex')).toBeTruthy()
    expect(screen.getByText('https://plex')).toBeTruthy()
  })

  it('reports an embed-mode change', () => {
    const onEmbedModeChange = vi.fn()
    render(
      <AppRow
        app={app}
        busy={false}
        onEmbedModeChange={onEmbedModeChange}
        onDelete={vi.fn()}
      />
    )
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'iframe' },
    })
    expect(onEmbedModeChange).toHaveBeenCalledWith('iframe')
  })

  it('calls onDelete when Remove is clicked', () => {
    const onDelete = vi.fn()
    render(
      <AppRow
        app={app}
        busy={false}
        onEmbedModeChange={vi.fn()}
        onDelete={onDelete}
      />
    )
    fireEvent.click(screen.getByText('Remove'))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('disables the controls while busy', () => {
    render(
      <AppRow app={app} busy onEmbedModeChange={vi.fn()} onDelete={vi.fn()} />
    )
    const removeButton = screen.getByText('Remove').closest('button')
    expect(removeButton?.disabled).toBe(true)
  })
})
