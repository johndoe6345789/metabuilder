import { redirect } from 'next/navigation'
import { tenantGodPanelPath } from '@/lib/tenant/workspace-paths'

/**
 * The God Panel moved to /{tenant}/panel/god when chrome was confined to the
 * panel. Old links keep working rather than falling through to [package],
 * which would try to load "god-panel" as a package and report it missing.
 */
export default async function GodPanelMoved({
  params,
}: {
  params: Promise<{ tenantSlug: string; rest?: string[] }>
}) {
  const { tenantSlug, rest } = await params
  redirect(tenantGodPanelPath(tenantSlug, rest?.[0]))
}
