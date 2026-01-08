/**
 * Package Home Page
 * 
 * Default page for /{tenant}/{package}
 * Shows the package dashboard/home component.
 */

import { notFound } from 'next/navigation'
import { join } from 'path'
import { loadJSONPackage } from '@/lib/packages/json/functions/load-json-package'
import { renderJSONComponent } from '@/lib/packages/json/render-json-component'
import { getPackagesDir } from '@/lib/packages/unified/get-packages-dir'

interface PackagePageProps {
  params: Promise<{
    tenant: string
    package: string
  }>
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { tenant, package: pkg } = await params

  // Load package from filesystem
  try {
    const packageData = await loadJSONPackage(join(getPackagesDir(), pkg))
    
    // Find home component: prioritize 'home_page', then 'HomePage', then 'Home', then first component
    const homeComponent = packageData.components?.find(c => 
      c.id === 'home_page' || 
      c.name === 'HomePage' ||
      c.name === 'Home'
    ) ?? packageData.components?.[0]

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (homeComponent === null || homeComponent === undefined) {
      // Package exists but has no components
      notFound()
    }

    // Render the home component with tenant and package context
    return renderJSONComponent(homeComponent, { tenant, package: pkg }, {})
  } catch (error) {
    // Package doesn't exist or can't be loaded
    console.error(`Failed to load package ${pkg}:`, error)
    notFound()
  }
}

export async function generateMetadata({ params }: PackagePageProps) {
  const { tenant, package: pkg } = await params
  
  // Try to load package metadata
  try {
    const packageData = await loadJSONPackage(join(getPackagesDir(), pkg))
    return {
      title: `${packageData.metadata.name} - ${tenant} | MetaBuilder`,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      description: (packageData.metadata.description !== null && packageData.metadata.description !== undefined && packageData.metadata.description.length > 0) 
        ? packageData.metadata.description 
        : `${packageData.metadata.name} package for tenant ${tenant}`,
    }
  } catch {
    // Fallback if package can't be loaded
    return {
      title: `${pkg} - ${tenant} | MetaBuilder`,
      description: `${pkg} package for tenant ${tenant}`,
    }
  }
}
