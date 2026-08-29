'use client'

import { Typography } from '@/m3'
import s from './page.module.scss'

/**
 * Where a password actually gets changed.
 *
 * This panel used to offer a "Request new password" button that set a
 * local flag and told the reader their request had been queued. Nothing
 * was queued: there is no reset endpoint, no reset entity, and the data
 * layer's OIDC provider advertises only the authorization_code and
 * refresh_token grants -- so no part of the stack could have carried such
 * a request. Rather than keep a control that lies about what it did, the
 * panel says where credentials are held and who can change one.
 */
export function ProfileSecurity() {
  return (
    <aside className={s.panel}>
      <div className={s.cardHeader}>
        <div>
          <Typography variant="h6">Security</Typography>
          <p>Where your sign-in credentials are held.</p>
        </div>
      </div>
      <div className={s.securityCard}>
        <span className="material-symbols-rounded">mail_lock</span>
        <div>
          <strong>Password changes</strong>
          <p>
            Your password lives with the sign-in provider, not with this
            profile. Self-service reset is not available yet — ask an
            operator to set a new one for you.
          </p>
        </div>
      </div>
    </aside>
  )
}
