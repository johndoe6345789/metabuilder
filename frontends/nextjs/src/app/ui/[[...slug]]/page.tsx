import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { loadPageFromDb } from '@/lib/ui-pages/load-page-from-db'
import { loadPageFromLuaPackages } from '@/lib/ui-pages/load-page-from-lua-packages'

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
 * 2. Database → Load page record
 * 3. Lua actions → Execute if present
 * 4. UIPageRenderer → Generate React components
 * 5. User sees rendered page
 */
export default async function DynamicUIPage({ params }: PageProps) {
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []
  const path = '/' + slug.join('/')

  // Prefer Lua package-based UI pages, fallback to database-backed pages
  const rawPageData = (await loadPageFromLuaPackages(path)) ?? (await loadPageFromDb(path))

  if (rawPageData === null || rawPageData === undefined) {
    notFound()
  }

  // Transform PageConfig to UIPageData
  const pageData = {
    layout: rawPageData,
    actions: {},
  }

  // Check authentication if required
  // TODO: Add auth check based on pageData.requireAuth and pageData.requiredRole

  return <UIPageRenderer pageData={pageData} />
}

/**
 * Generate metadata for the page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug ?? []
  const path = '/' + slug.join('/')

  const pageData = (await loadPageFromLuaPackages(path)) ?? (await loadPageFromDb(path))

  if (pageData === null || pageData === undefined) {
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
export async function generateStaticParams() {
  // TODO: Query database for all active pages
  // For now, return empty array (all pages will be dynamic)
  return []
}
