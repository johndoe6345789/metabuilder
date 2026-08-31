'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { Typography, Paper, Button, Divider, Chip } from '@/m3'
import s from '../page.module.scss'

export function AccountPanel() {
  const auth = useAuthContext()

  return (
    <Paper className={s.panel}>
      <Typography variant="h6" gutterBottom>
        Account
      </Typography>
      <div className={s.accountRow}>
        <Typography variant="body2">Username</Typography>
        <Typography variant="body2" className={s.value}>
          {auth.user?.username ?? 'N/A'}
        </Typography>
      </div>
      <div className={s.accountRow}>
        <Typography variant="body2">Email</Typography>
        <Typography variant="body2" className={s.value}>
          {auth.user?.email ?? 'N/A'}
        </Typography>
      </div>
      <div className={s.accountRow}>
        <Typography variant="body2">Role</Typography>
        <Chip label={auth.user?.role ?? 'user'} size="small" />
      </div>
      <Divider className={s.divider} />
      <Button
        variant="outlined"
        color="error"
        size="small"
        onClick={() => {
          void auth.logout()
        }}
      >
        Sign Out
      </Button>
    </Paper>
  )
}
