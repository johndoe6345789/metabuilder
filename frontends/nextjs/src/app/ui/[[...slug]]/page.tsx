import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import type { JSONComponent } from '@/lib/packages/json/types'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { loadPageFromDb } from '@/lib/ui-pages/load-page-from-db'

interface PageProps {
  params: Promise<{
    slug?: string[]
  }>
}

/**
 * Generic dynamic route for database-driven UI pages
 * Handles all paths: /ui, /ui/login, /ui/dashboard, etc.
 *
 * Flow:
 * 1. JSON seed data → Database (via import-ui-pages.ts)
 * 2. Database → Load component tree
 * 3. UIPageRenderer → Generate React components
 * 4. User sees rendered page
 */
export default async function DynamicUIPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []
  const path = '/' + slug.join('/')

  const rawPageData = await loadPageFromDb(path)

  if (rawPageData === null) {
    notFound()
  }

  const componentTree = rawPageData.componentTree
  if (componentTree === null || componentTree === undefined) {
    notFound()
  }

  const layout = componentTree as JSONComponent
  if (typeof layout !== 'object' || Array.isArray(layout)) {
    notFound()
  }

  return <UIPageRenderer layout={layout} actions={{}} />
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []
  const path = '/' + slug.join('/')

  const pageData = await loadPageFromDb(path)

  if (pageData === null) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: pageData.title,
    description: `MetaBuilder - ${pageData.title}`,
  }
}

/**
 * Optional: Generate static params for known pages
 * This enables static generation at build time
 */
export function generateStaticParams() {
  // TODO: Query database for all active pages
  // For now, return empty array (all pages will be dynamic)
  return []
}
