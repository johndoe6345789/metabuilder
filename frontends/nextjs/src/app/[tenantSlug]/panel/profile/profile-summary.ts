/** The read-only facts shown above the profile form. */

export interface ProfileSummary {
  username: string
  email: string
  role: string
  roleLevel: number
  initial: string
  joined: string
}

export interface ProfileSource {
  username?: string | null
  email?: string | null
  role?: string | null
  createdAt?: number | string | null
}

/** A joined date a person can read, or an honest note that there isn't one. */
export function formatJoined(createdAt: number | string | null): string {
  if (createdAt === null || createdAt === '') return 'Not recorded'
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Not recorded'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function summarise(
  user: ProfileSource | null,
  roleLevel: number
): ProfileSummary {
  const username = user?.username ?? 'User'
  return {
    username,
    email: user?.email ?? '',
    role: user?.role ?? 'user',
    roleLevel,
    initial: username.charAt(0).toUpperCase(),
    joined: formatJoined(user?.createdAt ?? null),
  }
}
