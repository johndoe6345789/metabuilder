'use client'

const DBAL_URL =
  process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'

/** Instance-wide accounts live in the system tenant, which is where the
 *  list this picks from is read (see use-power-transfer-users.ts). */
const userUrl = (id: string): string => `${DBAL_URL}/system/core/User/${id}`

export interface TransferOutcome {
  ok: boolean
  message: string
}

async function setRole(id: string, role: string): Promise<string | null> {
  try {
    const res = await fetch(userUrl(id), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role }),
      signal: AbortSignal.timeout(8000),
    })
    return res.ok ? null : `HTTP ${res.status}`
  } catch {
    return 'the data layer could not be reached'
  }
}

/**
 * Hands instance ownership to somebody else.
 *
 * The button that said this had no handler at all, under a warning that
 * the action "cannot be undone" -- pressing it did nothing, which is the
 * one outcome a critical action must not share with success.
 *
 * The new owner is promoted **first**. If that fails nothing has changed.
 * If it succeeds and the demotion then fails there are two supergods,
 * which either of them can put right; doing it the other way round risks
 * leaving the instance with none, which nobody can.
 */
export async function transferPower(
  fromUserId: string,
  toUserId: string
): Promise<TransferOutcome> {
  const promoted = await setRole(toUserId, 'supergod')
  if (promoted !== null) {
    return {
      ok: false,
      message: `Nothing was changed — the promotion was refused (${promoted}).`,
    }
  }

  const demoted = await setRole(fromUserId, 'god')
  if (demoted !== null) {
    return {
      ok: false,
      message:
        'They are now a supergod, but your own account could not be ' +
        `stepped down (${demoted}). There are two supergods until one of ` +
        'you changes that.',
    }
  }

  return {
    ok: true,
    message: 'Done. They are the instance owner now, and you are a god.',
  }
}
