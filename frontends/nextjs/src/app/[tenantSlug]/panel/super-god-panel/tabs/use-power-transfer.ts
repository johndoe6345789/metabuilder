'use client'

import { useCallback, useState } from 'react'
import { transferPower, type TransferOutcome } from './transfer-power'

export interface PowerTransfer {
  /** True once the operator has asked for it and before they confirm. */
  confirming: boolean
  ask: () => void
  cancel: () => void
  confirm: () => Promise<void>
  running: boolean
  outcome: TransferOutcome | null
}

/**
 * The two steps of handing the instance over: ask, then confirm.
 *
 * A confirmation because it cannot be undone -- the tab says so in its
 * own warning -- and because the button that used to sit there did
 * nothing at all, so nobody has ever pressed this expecting it to work.
 */
export function usePowerTransfer(
  fromUserId: string | undefined,
  toUserId: string | null
): PowerTransfer {
  const [confirming, setConfirming] = useState(false)
  const [running, setRunning] = useState(false)
  const [outcome, setOutcome] = useState<TransferOutcome | null>(null)

  const confirm = useCallback(async () => {
    if (fromUserId === undefined || toUserId === null) return
    setRunning(true)
    setOutcome(await transferPower(fromUserId, toUserId))
    setRunning(false)
    setConfirming(false)
  }, [fromUserId, toUserId])

  return {
    confirming,
    ask: useCallback(() => {
      setOutcome(null)
      setConfirming(true)
    }, []),
    cancel: useCallback(() => {
      setConfirming(false)
    }, []),
    confirm,
    running,
    outcome,
  }
}
