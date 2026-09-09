'use client'

import { Button, Typography } from '@/m3'
import type { PowerTransfer } from './use-power-transfer'
import s from './PowerTransferTab.module.scss'

export interface PowerTransferConfirmProps {
  transfer: PowerTransfer
  /** The account that would become the instance owner. */
  toName: string
  canTransfer: boolean
}

/** The button, the are-you-sure, and what happened. */
export function PowerTransferConfirm({
  transfer,
  toName,
  canTransfer,
}: PowerTransferConfirmProps) {
  if (transfer.confirming) {
    return (
      <div className={s.warning}>
        <Typography variant="subtitle2" className={s.warningTitle}>
          Hand the instance to {toName}?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          They become the instance owner and you become a god. Only they
          will be able to give it back.
        </Typography>
        <div className={s.confirmRow}>
          <Button
            variant="contained"
            disabled={transfer.running}
            onClick={() => {
              void transfer.confirm()
            }}
          >
            {transfer.running ? 'Transferring…' : `Yes, hand it to ${toName}`}
          </Button>
          <Button variant="text" onClick={transfer.cancel}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {transfer.outcome !== null && (
        <Typography
          variant="body2"
          role="alert"
          className={transfer.outcome.ok ? s.done : s.failed}
        >
          {transfer.outcome.message}
        </Typography>
      )}
      <Button
        variant="contained"
        fullWidth
        disabled={!canTransfer}
        className={s.transferBtn}
        onClick={transfer.ask}
      >
        Initiate Power Transfer
      </Button>
    </>
  )
}
