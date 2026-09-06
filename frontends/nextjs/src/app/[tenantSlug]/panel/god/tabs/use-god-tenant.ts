'use client'

/**
 * Whether the persisted God Panel draft belongs to the signed-in tenant.
 *
 * The god slice persists per browser origin, so a second tenant signing in
 * on the same browser inherits the first one's draft. That was fixed for
 * the component tree by guarding inside useComponentTree -- and the fix
 * covered exactly the one slice key it was written for. `css` was left
 * open: a founder's Styles tab showed another tenant's classes, marked as
 * staged changes and one click from being published into their own data.
 *
 * So the decision lives here, once, and both hooks read it. Clearing every
 * tenant-owned key together is what stops the next hook from inheriting
 * the same gap: a new one has to opt out rather than remember to opt in.
 */

import { useEffect } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { useAppDispatch } from '@/store/hooks'
import { resetTenantOwned } from '@/store/slices/god-slice'
import {
  treeBelongsToAnother,
  writeTreeTenant,
} from './builder/tree-tenant'

export interface GodTenant {
  /** The signed-in tenant, or the "system" fallback while auth resolves. */
  tenant: string
  /** True once auth has answered; nothing is cleared before it has. */
  known: boolean
  /**
   * True when what is persisted belongs to a different tenant. Derived
   * during render, not in an effect, so no consumer ever gets one render
   * holding the other tenant's content.
   */
  foreign: boolean
}

export function useGodTenant(): GodTenant {
  const dispatch = useAppDispatch()
  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)
  // While auth resolves, and when signed out, `tenant` is the fallback
  // rather than an answer -- acting on it would blank a real draft.
  const known = !auth.isLoading && auth.user != null
  const foreign = treeBelongsToAnother(tenant, known)

  useEffect(() => {
    if (!known) return
    // Straight to a reset rather than through the builder's commit(): a
    // tenant's content must not land on the undo stack, where Ctrl+Z
    // would put it back.
    if (foreign) dispatch(resetTenantOwned())
    writeTreeTenant(tenant)
  }, [foreign, tenant, known, dispatch])

  return { tenant, known, foreign }
}
