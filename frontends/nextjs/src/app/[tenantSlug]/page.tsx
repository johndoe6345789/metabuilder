import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import type { JSONComponent } from '@/lib/packages/json/types'

interface Props {
  params: Promise<{ tenantSlug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenantSlug } = await params
  const page = await fetchTenantPage(tenantSlug, '/')
  const display = tenantSlug.charAt(0).toUpperCase() + tenantSlug.slice(1)
  return { title: page?.title ?? display }
}

export default async function TenantHomePage({ params }: Props) {
  const { tenantSlug } = await params
  const page = await fetchTenantPage(tenantSlug, '/')

  if (page?.isActive !== true) {
    notFound()
  }

  if (page.componentTree == null) {
    notFound()
  }

  return (
    <UIPageRenderer layout={page.componentTree as JSONComponent} actions={{}} />
  )
}
