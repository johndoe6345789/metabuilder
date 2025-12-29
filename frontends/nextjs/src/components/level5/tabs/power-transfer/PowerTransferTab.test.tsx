import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { User } from '@/lib/level-types'

import { PowerTransferTab } from './PowerTransferTab'

const superGodUser: User = {
  id: 'user_supergod',
  username: 'supergod',
  email: 'supergod@metabuilder.local',
  role: 'supergod',
  createdAt: Date.now(),
}

const targetUser: User = {
  id: 'user_target',
  username: 'target-god',
  email: 'target@example.com',
  role: 'god',
  createdAt: Date.now(),
}

const renderComponent = (overrides?: { onInitiate?: () => void }) => {
  const onInitiateTransfer = overrides?.onInitiate ?? vi.fn()
  render(
    <PowerTransferTab
      currentUser={superGodUser}
      allUsers={[superGodUser, targetUser]}
      onInitiateTransfer={onInitiateTransfer}
    />
  )
  return { onInitiateTransfer }
}

const mockFetch = (payload: any) => {
  const fetchMock = vi.fn(async () => ({
    ok: true,
    json: async () => payload,
  }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PowerTransferTab', () => {
  it('loads transfer history and shows target records', async () => {
    const requestPayload = {
      requests: [
        {
          id: 'req1',
          fromUserId: superGodUser.id,
          toUserId: targetUser.id,
          status: 'pending',
          createdAt: Date.now(),
          expiresAt: Date.now() + 100000,
        },
      ],
    }

    const fetchMock = mockFetch(requestPayload)

    renderComponent()

    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    await screen.findByText(/Recent transfers/i)
    expect(screen.getByText(/Transfer to target-god/i)).toBeDefined()
    expect(screen.getByText(/Requested by supergod/i)).toBeDefined()
  })

  it('fires onInitiateTransfer when a user card is clicked', async () => {
    mockFetch({ requests: [] })

    const { onInitiateTransfer } = renderComponent()

    await screen.findByText(/Select User/i)

    fireEvent.click(screen.getByText('target-god'))
    const actionButton = screen.getByRole('button', { name: /Initiate Power Transfer/i })
    fireEvent.click(actionButton)

    expect(onInitiateTransfer).toHaveBeenCalledWith(targetUser.id)
  })
})
