/**
 * What a tenant's published home page calls itself.
 *
 * This is the URL a founder hands out, so it is the one that most needs to
 * say what it is: it is the browser tab, the search result and the preview
 * card that appears when the link is pasted anywhere. Until this existed
 * every founder's site reported itself as "MetaBuilder - Data-Driven
 * Application Platform", because the route was a client component and a
 * client component cannot carry metadata at all.
 */

import type { Metadata } from 'next'

import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import { mayViewPage } from '@/lib/tenant/page-access'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'

interface MetadataProps {
  params: Promise<{ tenantSlug?: string }>
}

export async function generateMetadata({
  params,
}: MetadataProps): Promise<Metadata> {
  const { tenantSlug } = await params
  const tenant = normalizeTenantId(tenantSlug)
  const page = await fetchTenantPage(tenant, '/')

  // A title and description are content: a restricted page must not
  // describe itself in a tab, a search result or a link preview either.
  if (
    page === null ||
    !page.isActive ||
    page.title.length === 0 ||
    !(await mayViewPage(page))
  ) {
    return { title: tenant }
  }

  const description =
    page.description !== null &&
    page.description !== undefined &&
    page.description.length > 0
      ? page.description
      : undefined

  return {
    title: page.title,
    description,
    // Without these a founder sharing their own link gets a bare URL with
    // no card, wherever they paste it.
    openGraph: {
      title: page.title,
      description,
      type: 'website',
      siteName: tenant,
    },
    twitter: { card: 'summary_large_image', title: page.title, description },
  }
}
