import type { IrcMessage } from './types'

/** Epoch milliseconds, from an ISO string or a number. */
export function toMs(at: string | number): number {
  if (typeof at === 'number') return at
  const parsed = new Date(at).getTime()
  // An unparseable date sorted every message it was on to the front,
  // because NaN comparisons are false and the sort left them where they
  // fell. Treat it as the beginning of time, which is where an undated
  // message belongs.
  return Number.isNaN(parsed) ? 0 : parsed
}

/** What the server has, plus what this browser sent, oldest first. */
export function mergeMessages(
  fromServer: IrcMessage[],
  local: IrcMessage[]
): IrcMessage[] {
  return [...fromServer, ...local].sort(
    (a, b) => toMs(a.createdAt) - toMs(b.createdAt)
  )
}
