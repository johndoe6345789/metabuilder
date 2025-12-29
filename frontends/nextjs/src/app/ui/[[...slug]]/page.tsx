import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { UIPageRenderer } from '@/components/ui-page-renderer/UIPageRenderer'
import { loadPageFromDB } from '@/lib/ui-pages/load-page-from-db'

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
  const slug = resolvedParams.slug || []
  const path = '/' + slug.join('/')

  // Load page from database
  const pageData = await loadPageFromDB(path)

  if (!pageData) {
    notFound()
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
  const slug = resolvedParams.slug || []
  const path = '/' + slug.join('/')

  const pageData = await loadPageFromDB(path)

  if (!pageData) {
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
