import { useState, useEffect } from 'react'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface GodUser {
  id: string
  username: string
  email: string
  role: string
}

/** Every user eligible to receive Super God power -- everyone but the
 *  current user and any existing Super God -- plus which one is picked. */
export function usePowerTransferUsers(currentUserId: string | undefined) {
  const [allUsers, setAllUsers] = useState<GodUser[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/user`, {
      signal: AbortSignal.timeout(5000),
    })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: GodUser[] } | null) => {
        if (json?.data != null) {
          setAllUsers(
            json.data.filter(
              u => u.id !== currentUserId && u.role !== 'supergod'
            )
          )
        }
      })
      .catch(() => {
        /* offline */
      })
  }, [currentUserId])

  return { allUsers, selectedUserId, setSelectedUserId }
}
