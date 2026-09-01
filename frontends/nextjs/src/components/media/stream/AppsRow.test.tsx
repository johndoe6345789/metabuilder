import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const streamApps = vi.hoisted(() => ({ useStreamApps: vi.fn() }))
vi.mock('./useStreamApps', () => streamApps)

const settingsModal = vi.hoisted(() => ({
  AppsSettingsModal: (props: { onClose: () => void }) => (
    <div data-testid="settings-modal">
      <button onClick={props.onClose}>close-settings</button>
    </div>
  ),
}))
vi.mock('./AppsSettingsModal', () => settingsModal)

import { AppsRow } from './AppsRow'
import type { StreamApp } from './useStreamApps'

const app: StreamApp = {
  id: 'a1',
  name: 'Discord',
  url: 'https://discord.com',
  bgColor: '#000',
  fgColor: '#fff',
  embedMode: 'iframe',
}

function mockApps(overrides: Partial<ReturnType<typeof mockState>>) {
  streamApps.useStreamApps.mockReturnValue({ ...mockState(), ...overrides })
}

function mockState() {
  return {
    apps: [] as StreamApp[],
    loading: false,
    error: null as string | null,
    createApp: vi.fn(),
    updateApp: vi.fn(),
    deleteApp: vi.fn(),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockApps({})
})

describe('AppsRow', () => {
  it('renders an app tile per app when loaded without error', () => {
    mockApps({ apps: [app] })
    render(<AppsRow />)
    expect(screen.getByText('Discord')).toBeTruthy()
  })

  it('shows no app tiles while loading', () => {
    mockApps({ apps: [app], loading: true })
    render(<AppsRow />)
    expect(screen.queryByText('Discord')).toBeNull()
  })

  it('shows no app tiles when there is an error', () => {
    mockApps({ apps: [app], error: 'offline' })
    render(<AppsRow />)
    expect(screen.queryByText('Discord')).toBeNull()
  })

  it('opens the settings modal from the Manage tile', () => {
    render(<AppsRow />)
    expect(screen.queryByTestId('settings-modal')).toBeNull()

    fireEvent.click(screen.getByText('Manage'))

    expect(screen.getByTestId('settings-modal')).toBeTruthy()
  })

  it('closes the settings modal', () => {
    render(<AppsRow />)
    fireEvent.click(screen.getByText('Manage'))

    fireEvent.click(screen.getByText('close-settings'))

    expect(screen.queryByTestId('settings-modal')).toBeNull()
  })
})
