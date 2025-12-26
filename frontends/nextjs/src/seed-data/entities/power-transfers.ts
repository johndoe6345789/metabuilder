import { Database } from '@/lib/database'
import type { PowerTransferRequest } from '@/lib/level-types'

export async function initializePowerTransfers() {
  const existing = await Database.getPowerTransferRequests()
  if (existing.length > 0) {
    return
  }

  const now = Date.now()
  const requests: PowerTransferRequest[] = [
    {
      id: 'req_demo_pending',
      fromUserId: 'user_supergod',
      toUserId: 'user_admin',
      status: 'pending',
      createdAt: now - 5 * 60 * 1000,
      expiresAt: now + 55 * 60 * 1000,
    },
    {
      id: 'req_demo_accepted',
      fromUserId: 'user_supergod',
      toUserId: 'user_god',
      status: 'accepted',
      createdAt: now - 2 * 60 * 60 * 1000,
      expiresAt: now - 60 * 60 * 1000,
    },
  ]

  await Database.setPowerTransferRequests(requests)
}
