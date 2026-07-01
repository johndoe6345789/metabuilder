/**
 * irc-api — thin DBAL fetch helpers for IRC channels + messages
 */
import type { IrcChannel, IrcMessage } from './types'

const DBAL = process.env.NEXT_PUBLIC_DBAL_API_URL ?? 'http://localhost:8080'
const TENANT = 'default'

export async function fetchChannels(): Promise<IrcChannel[]> {
  const res = await fetch(
    `${DBAL}/v1/${TENANT}/irc/irc_channel`,
    { signal: AbortSignal.timeout(3000) },
  )
  if (!res.ok) throw new Error('channels fetch failed')
  const json = (await res.json()) as { data?: IrcChannel[] }
  return json.data ?? []
}

export async function fetchMessages(channelId: string): Promise<IrcMessage[]> {
  const res = await fetch(
    `${DBAL}/v1/${TENANT}/irc/irc_message?channelId=${channelId}`,
    { signal: AbortSignal.timeout(3000) },
  )
  if (!res.ok) throw new Error('messages fetch failed')
  const json = (await res.json()) as { data?: IrcMessage[] }
  return json.data ?? []
}

export async function postMessage(
  channelId: string,
  content: string,
  username: string,
  tenantId: string,
): Promise<void> {
  await fetch(`${DBAL}/v1/${tenantId}/irc/irc_message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      channelId, content, createdBy: username, tenantId,
    }),
    signal: AbortSignal.timeout(4000),
  })
}
