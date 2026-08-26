'use client'

import Link from 'next/link'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { getRoleLevel } from '@/lib/constants'
import { getLevelLabel } from '@/lib/packages/navigation'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'
import s from './page.module.scss'

const LEVEL_COLORS = {
  1: { from: '#3b82f6', to: '#2563eb' },
  2: { from: '#22c55e', to: '#16a34a' },
  3: { from: '#f97316', to: '#ea580c' },
  4: { from: '#a855f7', to: '#9333ea' },
  5: { from: '#f59e0b', to: '#d97706' },
} as const

const LEVELS = [
  { level: 1, name: 'Public Website', desc: 'Landing pages, public content' },
  { level: 2, name: 'User Area', desc: 'Profiles, comments, chat' },
  { level: 3, name: 'Admin Panel', desc: 'CRUD, user management' },
  { level: 4, name: 'God Builder', desc: 'Schemas and JSON workflows' },
  { level: 5, name: 'Super God', desc: 'Multi-tenant control' },
] as const

function iconGradient(level: number) {
  const c = LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
  return `linear-gradient(135deg, ${c.from} 0%, ${c.to} 100%)`
}

export function DashboardContent() {
  const auth = useAuthContext()
  const user = auth.user
  const userLevel = getRoleLevel(user?.role ?? 'user')
  const levelColor =
    LEVEL_COLORS[userLevel as keyof typeof LEVEL_COLORS]?.from ?? '#9c27b0'
  const godPanelHref = tenantGodPanelPath(user?.tenantId)

  const quickActions = [
    {
      href: '/profile',
      icon: '👤',
      title: 'Profile',
      desc: 'Edit your profile information',
      minLevel: 1,
    },
    {
      href: '/comments',
      icon: '💬',
      title: 'Comments',
      desc: 'View community discussion',
      minLevel: 1,
    },
    {
      href: '/admin',
      icon: '🛡️',
      title: 'Admin Panel',
      desc: 'Manage users and data',
      minLevel: 3,
    },
    {
      href: godPanelHref,
      icon: '⚡',
      title: 'God Panel',
      desc: 'Application builder tools',
      minLevel: 4,
    },
    {
      href: '/super-god-panel',
      icon: '👑',
      title: 'Super God',
      desc: 'Multi-tenant platform control',
      minLevel: 5,
    },
  ].filter(a => userLevel >= a.minLevel)

  return (
    <div className={s.root}>
      {/* Profile card */}
      <div className={s.profileCard}>
        <div className={s.profileRow}>
          <div
            className={s.avatar}
            style={{
              background: `linear-gradient(135deg, ${levelColor} 0%, ${LEVEL_COLORS[userLevel as keyof typeof LEVEL_COLORS]?.to ?? levelColor} 100%)`,
            }}
          >
            {(user?.username ?? 'U').charAt(0).toUpperCase()}
          </div>
          <div className={s.profileInfo}>
            <p className={s.profileName}>
              {user?.username ?? user?.name ?? 'User'}
            </p>
            <p className={s.profileEmail}>{user?.email ?? ''}</p>
            <div className={s.profileBadges}>
              <span
                className={`${s.chip} ${s.chipFilled}`}
                style={{ background: levelColor }}
              >
                Level {userLevel} — {getLevelLabel(userLevel)}
              </span>
              <span className={`${s.chip} ${s.chipOutlined}`}>
                {user?.role ?? 'user'}
              </span>
            </div>
          </div>
        </div>
        {user?.bio != null && user.bio !== '' && (
          <p className={s.bio}>{user.bio}</p>
        )}
      </div>

      {/* Quick actions */}
      <p className={s.sectionTitle}>Quick Actions</p>
      <div className={s.actionsGrid}>
        {quickActions.map(a => (
          <Link key={a.href} href={a.href} className={s.actionCard}>
            <div className={s.actionIcon}>{a.icon}</div>
            <p className={s.actionTitle}>{a.title}</p>
            <p className={s.actionDesc}>{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Admin+ get the permission-tier reference; User/Moderator get
          whatever's published to /dashboard/community via God Panel
          (a welcome/community section by default — see WorkspacePageSlot). */}
      {userLevel >= 3 ? (
        <>
          <p className={s.sectionTitle}>Five Levels of Power</p>
          <div className={s.levelsGrid}>
            {LEVELS.map(({ level, name, desc }) => {
              const unlocked = userLevel >= level
              const isAmber = level === 5
              return (
                <div
                  key={level}
                  className={[
                    s.levelCard,
                    unlocked ? s.levelCardUnlocked : '',
                    isAmber ? s.levelCardAmber : '',
                  ].join(' ')}
                >
                  <div
                    className={s.levelIcon}
                    style={{ background: iconGradient(level) }}
                  >
                    {level}
                  </div>
                  <p className={s.levelName}>{name}</p>
                  <p className={s.levelDesc}>{desc}</p>
                  <span
                    className={`${s.levelBadge} ${unlocked ? '' : s.levelBadgeLocked}`}
                    style={
                      unlocked
                        ? {
                            background:
                              LEVEL_COLORS[level as keyof typeof LEVEL_COLORS].from,
                          }
                        : {}
                    }
                  >
                    {unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <WorkspacePageSlot path="/dashboard/community">
          <p className={s.sectionTitle}>Welcome</p>
        </WorkspacePageSlot>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <WorkspacePageSlot path="/dashboard">
      <LevelGate minLevel={1} levelName="User">
        <DashboardContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
