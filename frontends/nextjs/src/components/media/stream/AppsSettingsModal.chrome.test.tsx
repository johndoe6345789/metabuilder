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

describe('AppsSettingsModal', () => {
  it('lists existing apps', () => {
    render(
      <AppsSettingsModal
        apps={[app]}
        onClose={vi.fn()}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    expect(screen.getByText('plex')).toBeTruthy()
  })

  it('closes on overlay click but not on panel click', () => {
    const onClose = vi.fn()
    const { container } = render(
      <AppsSettingsModal
        apps={[]}
        onClose={onClose}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText('Manage apps & services'))
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(container.firstElementChild as Element)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('closes via the close button', () => {
    const onClose = vi.fn()
    render(
      <AppsSettingsModal
        apps={[]}
        onClose={onClose}
        onCreate={vi.fn()}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
      />
    )
    fireEvent.click(screen.getByLabelText('Close'))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
