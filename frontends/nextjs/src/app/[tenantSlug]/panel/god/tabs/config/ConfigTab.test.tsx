import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const tab = vi.hoisted(() => ({ useConfigTab: vi.fn() }))
vi.mock('./use-config-tab', () => tab)

import { ConfigTab } from './ConfigTab'

const stub = (over: Record<string, unknown> = {}): void => {
  tab.useConfigTab.mockReturnValue({
    dd: {
      configs: [],
      create: vi.fn(),
      rename: vi.fn(),
      addOption: vi.fn(),
      removeOption: vi.fn(),
      remove: vi.fn(),
    },
    smtp: {
      config: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
      },
      dirty: false,
      publishing: false,
      set: vi.fn(),
      publish: vi.fn(),
    },
    ui: {
      newListName: '',
      setNewListName: vi.fn(),
      optLabel: '',
      setOptLabel: vi.fn(),
      optValue: '',
      setOptValue: vi.fn(),
    },
    selected: undefined,
    addList: vi.fn(),
    addOpt: vi.fn(),
    ...over,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  stub()
})

describe('ConfigTab', () => {
  it('prompts to create a list when none is selected', () => {
    render(<ConfigTab />)
    expect(screen.getByText('Create a list.')).toBeTruthy()
  })

  it('renders the selected list\'s options', () => {
    stub({
      selected: {
        id: 'd1',
        name: 'Status',
        options: [{ label: 'Active', value: 'active' }],
      },
    })
    render(<ConfigTab />)
    expect(screen.getByText('Active')).toBeTruthy()
  })

  it('renders the SMTP section', () => {
    render(<ConfigTab />)
    expect(screen.getByText('Email (SMTP)')).toBeTruthy()
  })

  it('masks the password field', () => {
    render(<ConfigTab />)
    const password = screen.getByLabelText('Password') as HTMLInputElement
    expect(password.type).toBe('password')
  })
})
