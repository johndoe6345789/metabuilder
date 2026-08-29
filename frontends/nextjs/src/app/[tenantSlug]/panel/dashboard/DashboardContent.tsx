'use client'

import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { getRoleLevel } from '@/lib/constants'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'
import { LevelsGrid } from './LevelsGrid'
import { ProfileCard } from './ProfileCard'
import { QuickActions } from './QuickActions'
import { quickActionsFor } from './quick-actions'
import s from './page.module.scss'

/**
 * The workspace landing page. Also registered as `dashboard_home`, so a
 * seeded PageConfig row can put it on a route of its own.
 *
 * Admins and above get the permission-tier reference; everyone else gets
 * whatever is published to /dashboard/community through the God Panel.
 */
export function DashboardContent() {
  const user = useAuthContext().user
  const userLevel = getRoleLevel(user?.role ?? 'user')
  const actions = quickActionsFor(userLevel, tenantGodPanelPath(user?.tenantId))

  return (
    <div className={s.root}>
      <ProfileCard
        username={user?.username ?? user?.name ?? 'User'}
        email={user?.email ?? ''}
        role={user?.role ?? 'user'}
        bio={user?.bio ?? null}
        userLevel={userLevel}
      />
      <QuickActions actions={actions} />
      {userLevel >= 3 ? (
        <LevelsGrid userLevel={userLevel} />
      ) : (
        <WorkspacePageSlot path="/dashboard/community">
          <p className={s.sectionTitle}>Welcome</p>
        </WorkspacePageSlot>
      )}
    </div>
  )
}
