import type { DapMessage } from '@/lib/flask-debugger'
import { dapRequest, type DapRequestMsg } from './debugger-requests'

export interface DapDeps {
  nextSeq: () => number
  pendingRef: { current: Map<number, (m: DapMessage) => void> }
  send: (msg: DapRequestMsg) => Promise<void>
}

/**
 * Promise-based DAP request: register a resolver keyed by seq, send the frame,
 * and resolve when the matching response arrives (rejecting on !success).
 */
export async function runDapRequest<T = unknown>(
  d: DapDeps,
  command: string,
  args: Record<string, unknown> = {},
): Promise<T> {
  const seq = d.nextSeq()
  const p = new Promise<DapMessage>(resolve =>
    d.pendingRef.current.set(seq, resolve),
  )
  await d.send(dapRequest(seq, command, args))
  const resp = await p
  if (!(resp as { success?: boolean }).success) {
    throw new Error(
      (resp as { message?: string }).message ?? `${command} failed`,
    )
  }
  return (resp as { body?: T }).body as T
}
