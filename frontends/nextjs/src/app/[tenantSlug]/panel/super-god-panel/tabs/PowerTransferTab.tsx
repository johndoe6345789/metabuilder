'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { Typography } from '@/m3'
import { usePowerTransferUsers } from './use-power-transfer-users'
import { PowerTransferUserRow } from './PowerTransferUserRow'
import { PowerTransferConfirm } from './PowerTransferConfirm'
import { usePowerTransfer } from './use-power-transfer'
import s from './PowerTransferTab.module.scss'

export function PowerTransferTab() {
  const auth = useAuthContext()
  const { allUsers, selectedUserId, setSelectedUserId } =
    usePowerTransferUsers(auth.user?.id)
  const transfer = usePowerTransfer(auth.user?.id, selectedUserId)
  const chosen = allUsers.find(user => user.id === selectedUserId)

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Transfer Super God Power
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Transfer your Super God privileges to another user. You will be
        downgraded to God.
      </Typography>

      <div className={s.warning}>
        <Typography variant="subtitle2" className={s.warningTitle}>
          Critical Action
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone. Only one Super God can exist at a time.
        </Typography>
      </div>

      <Typography variant="subtitle2" gutterBottom>
        Select User to Transfer Power To:
      </Typography>
      <div className={s.userList}>
        {allUsers.map(user => (
          <PowerTransferUserRow
            key={user.id}
            user={user}
            selected={selectedUserId === user.id}
            onSelect={setSelectedUserId}
          />
        ))}
        {allUsers.length === 0 && (
          <div className={s.empty}>
            <Typography variant="body2" color="text.secondary">
              No eligible users. Connect to DBAL to load users.
            </Typography>
          </div>
        )}
      </div>

      <PowerTransferConfirm
        transfer={transfer}
        toName={chosen?.username ?? 'them'}
        canTransfer={selectedUserId != null}
      />
    </div>
  )
}
