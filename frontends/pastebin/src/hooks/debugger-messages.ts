import type { Dispatch } from 'react'
import type { DapMessage } from '@/lib/flask-debugger'
import type { DebuggerAction } from './debugger-types'
import { onStopped, type InspectDeps } from './debugger-inspection'

export interface MessageDeps {
  dispatch: Dispatch<DebuggerAction>
  pendingRef: { current: Map<number, (m: DapMessage) => void> }
  onInitRef: { current: (() => Promise<void>) | null }
  inspectRef: { current: InspectDeps }
}

/** Route one DAP message: resolve a pending request or handle an event. */
export function handleDapMessage(d: MessageDeps, msg: DapMessage) {
  if (msg.type === 'response') {
    const seq = msg.request_seq as number
    const resolve = d.pendingRef.current.get(seq)
    if (resolve) {
      d.pendingRef.current.delete(seq)
      resolve(msg)
    }
    return
  }
  if (msg.type !== 'event') return

  switch (msg.event as string) {
    case 'initialized':
      void d.onInitRef.current?.()
      break
    case 'stopped': {
      const body = (msg.body ?? {}) as { reason?: string; threadId?: number }
      const tid = body.threadId ?? 1
      d.dispatch({ type: 'PAUSED', threadId: tid, file: null, line: null })
      void onStopped(d.inspectRef.current, tid)
      break
    }
    case 'continued':
      d.dispatch({ type: 'RUNNING' })
      break
    case 'terminated':
    case 'exited':
      d.dispatch({ type: 'TERMINATED' })
      break
    case 'output': {
      const body = (msg.body ?? {}) as { category?: string; output?: string }
      if (body.output) {
        d.dispatch({
          type: 'OUTPUT',
          category: body.category ?? 'stdout',
          text: body.output,
        })
      }
      break
    }
  }
}
