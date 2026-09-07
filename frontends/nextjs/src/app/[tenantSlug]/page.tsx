import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import { mayViewPage } from '@/lib/tenant/page-access'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import type { JSONComponent } from '@/lib/packages/json/types'
import { TenantHomeFallback } from './TenantHomeFallback'

/**
 * /{tenant} — the tenant's published home page.
 *
 * Deliberately outside the panel: this is a page someone built and
 * published, so it renders on its own, without the app bar or sidebar.
 * Those belong to the builder, not to what the builder produced.
 *
 * A server component, like every other published route. It was a client one
 * because this URL began life as the signed-in user's *workspace* and was
 * later repurposed as their public page, and client rendering had two costs
 * that only matter for something public: the server sent an empty document,
 * so a crawler and a link preview saw nothing; and the page could carry no
 * metadata at all, so the one URL a founder actually hands out reported
 * itself as "MetaBuilder - Data-Driven Application Platform".
 */
interface TenantHomeProps {
  params: Promise<{ tenantSlug?: string }>
}

export default async function TenantHomePage({ params }: TenantHomeProps) {
  const { tenantSlug } = await params
  const tenant = normalizeTenantId(tenantSlug)
  const page = await fetchTenantPage(tenant, '/')

  if (
    page !== null &&
    page.isActive &&
    page.componentTree !== null &&
    page.componentTree !== undefined &&
    (await mayViewPage(page))
  ) {
    return (
      <UIPageRenderer
        layout={page.componentTree as JSONComponent}
        actions={{}}
      />
    )
  }

  // Nothing published, or nothing this visitor may see. The client slot
  // applies the same LevelGate the rest of the app does.
  return <TenantHomeFallback tenant={tenant} />
}

export { generateMetadata } from './metadata'
