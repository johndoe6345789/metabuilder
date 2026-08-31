import { useEffect, useState } from 'react'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

export interface GodUser {
  id: string
  username: string
  email: string
  role: string
}

const FALLBACK_USERS: GodUser[] = [
  { id: '1', username: 'god', email: 'god@metabuilder.dev', role: 'god' },
  {
    id: '2',
    username: 'super',
    email: 'super@metabuilder.dev',
    role: 'supergod',
  },
]

/** Every god/supergod user, or two placeholder accounts when DBAL is
 *  unreachable -- this tab is a status view, not a form, so it should
 *  never render empty just because the daemon is down. */
export function useGodUsers(): GodUser[] {
  const [godUsers, setGodUsers] = useState<GodUser[]>([])

  useEffect(() => {
    fetch(`${DBAL_URL}/system/core/user`, { signal: AbortSignal.timeout(5000) })
      .then(res => (res.ok ? res.json() : null))
      .then((json: { data?: GodUser[] } | null) => {
        if (json?.data != null) {
          setGodUsers(
            json.data.filter(u => u.role === 'god' || u.role === 'supergod')
          )
        }
      })
      .catch(() => {
        setGodUsers(FALLBACK_USERS)
      })
  }, [])

  return godUsers
}
