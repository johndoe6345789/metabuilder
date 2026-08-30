'use client'

import { Sidebar } from './Sidebar'
import type { AppShellState } from './use-app-shell'
import s from './AppShell.module.scss'

/**
 * The sidebar and its backdrop, together, since neither renders without
 * the other -- shown whenever the sidebar is open, CSS hides it above the
 * breakpoint. Deciding that from React state instead would leave the
 * drawer uncovered if a breakpoint change were ever missed.
 */
export function ShellSidebarSlot({ shell }: { shell: AppShellState }) {
  if (!shell.showSidebar) return null

  return (
    <>
      <button
        type="button"
        className={s.backdrop}
        aria-label="Close sidebar"
        onClick={shell.toggleSidebar}
      />
      <div className={s.sidebarSlot}>
        <Sidebar
          userLevel={shell.userLevel}
          tenantId={shell.tenantId}
          username={shell.username}
          role={shell.role}
          packages={shell.packages}
          onNavigate={shell.navigate}
        />
      </div>
    </>
  )
}
