/**
 * The chat's reads and writes.
 *
 * Four things about the old URL were wrong at once -- `/v1`, a hardcoded
 * `default` tenant, the package `irc`, and snake_case entity names -- so
 * it could only ever 404, and the hook read that as "DBAL offline" and
 * fell back to localStorage. Chat had therefore never once reached the
 * data layer. DBAL's route is /{tenant}/{package}/{Entity}, and the
 * schema (entities/packages/irc.json) names the package `irc_webchat`
 * and the entities IRCChannel and IRCMessage.
 *
 * The tenant is a parameter with no default: every community's chat is
 * its own, and a constant here made them one shared room.
 */

import { readList } from '@/lib/db/read-list'
import type { IrcChannel, IrcMessage } from './types'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
const PACKAGE = 'irc_webchat'

const url = (tenant: string, entity: string): string =>
  `${DBAL}/${tenant}/${PACKAGE}/${entity}`

/** The schema calls the author `username`; this code has always said
 *  `createdBy`, so the two are joined here rather than in six views. */
function toMessage(row: Record<string, unknown>): IrcMessage {
  const author = row.username ?? row.createdBy
  return {
    ...(row as unknown as IrcMessage),
    createdBy: typeof author === 'string' ? author : 'unknown',
  }
}

export async function fetchChannels(tenant: string): Promise<IrcChannel[]> {
  const res = await fetch(url(tenant, 'IRCChannel'), {
    credentials: 'include',
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error('channels fetch failed')
  // readList, not `json.data`: the real envelope is {data:{data:[…]}}, so
  // reading one level handed back an object. The shell spreads what this
  // returns, and spreading an object threw "messages is not iterable" --
  // a crashed page, not an empty one.
  return readList<IrcChannel>(await res.json())
}

export async function fetchMessages(
  tenant: string,
  channelId: string
): Promise<IrcMessage[]> {
  const query = `?filter.channelId=${encodeURIComponent(channelId)}`
  const res = await fetch(`${url(tenant, 'IRCMessage')}${query}`, {
    credentials: 'include',
    signal: AbortSignal.timeout(3000),
  })
  if (!res.ok) throw new Error('messages fetch failed')
  return readList<Record<string, unknown>>(await res.json()).map(toMessage)
}

/** An id the row can be written under; DBAL requires one on create. */
export function messageId(): string {
  const rand = Math.random().toString(36).slice(2, 10)
  return `msg_${Date.now().toString(36)}_${rand}`
}

/**
 * Records that this person is in the channel.
 *
 * Best effort on purpose -- reading a channel does not depend on it --
 * but it was best effort at the wrong address: `/v1/default/irc/
 * irc_membership`, wrong in the same four ways the calls above were,
 * inside a `catch {}` that said nothing. It could never have worked, and
 * nothing would ever have said so.
 */
export async function joinChannel(
  tenant: string,
  channelId: string,
  userId: string,
  username: string
): Promise<boolean> {
  try {
    const res = await fetch(url(tenant, 'IRCMembership'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        id: `mem_${channelId}_${userId}`,
        tenantId: tenant,
        channelId,
        userId,
        username,
        role: 'member',
        joinedAt: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(4000),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function postMessage(
  tenant: string,
  channelId: string,
  content: string,
  username: string
): Promise<void> {
  const res = await fetch(url(tenant, 'IRCMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      id: messageId(),
      tenantId: tenant,
      channelId,
      content,
      // The field the schema declares. `createdBy` was not one of its
      // fields at all, so every message arrived with no author.
      username,
      type: 'message',
      createdAt: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(4000),
  })
  if (!res.ok) throw new Error(`message not sent (HTTP ${res.status})`)
}
