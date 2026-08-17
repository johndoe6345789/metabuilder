/**
 * Maps a PageConfig row's `component` name (e.g. "dashboard_home",
 * "user_list_admin" -- the values the `packages` repo's page-config.json
 * files declare, see packages/dashboard/page-config/page-config.json and
 * packages/user_manager/page-config/page-config.json) to the real React
 * component it should render.
 *
 * This is the system-package half of "if it's not in a package, it's not
 * in the product": a page's route/access-level is data (a seeded
 * PageConfig row), and this registry is what turns the `component` name in
 * that data back into actual code. The user-package half
 * (GodPackage/PackageManager, built earlier) uses the sibling
 * `componentTree` field on the same entity instead -- WorkspacePageSlot
 * checks `component` first and falls back to `componentTree`, so one
 * resolver serves both.
 *
 * Entries are the page's already-existing, already-working inner content
 * component (DashboardContent, AdminContent, ...) -- registering a page
 * here does not change its behavior, only how its route/access-level gets
 * decided.
 */

import type { ComponentType } from 'react'
import { DashboardContent } from '@/app/(workspace)/dashboard/page'
import { AdminContent } from '@/app/(workspace)/admin/page'

export const COMPONENT_REGISTRY: Record<string, ComponentType> = {
  dashboard_home: DashboardContent,
  user_list_admin: AdminContent,
}

export function resolveComponent(name: string | null | undefined): ComponentType | null {
  if (name == null) return null
  return COMPONENT_REGISTRY[name] ?? null
}
