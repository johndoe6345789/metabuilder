import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { fetchTenantPage } from '@/lib/tenant/fetch-tenant-page'
import type { JSONComponent } from '@/lib/packages/json/types'

interface Props {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant } = await params
  const page = await fetchTenantPage(tenant, '/')
  const display = tenant.charAt(0).toUpperCase() + tenant.slice(1)
  return { title: page?.title ?? display }
}

export default async function TenantHomePage({ params }: Props) {
  const { tenant } = await params
  const page = await fetchTenantPage(tenant, '/')

  if (page?.isActive !== true) {
    notFound()
  }

  if (page.componentTree == null) {
    notFound()
  }

  return (
    <UIPageRenderer
      layout={page.componentTree as JSONComponent}
      actions={{}}
    />
  )
}
