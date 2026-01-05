/**
 * Package Home Page
 * 
 * Default page for /{tenant}/{package}
 * Shows the package dashboard/home component.
 */

// notFound will be used when package loading is implemented
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { notFound } from 'next/navigation'

interface PackagePageProps {
  params: Promise<{
    tenant: string
    package: string
  }>
}

export default async function PackagePage({ params }: PackagePageProps) {
  const { tenant, package: pkg } = await params

  // TODO: Load package component dynamically
  // const packageData = await loadPackage(pkg)
  // if (!packageData?.homeComponent) {
  //   notFound()
  // }

  return (
    <div className="package-page">
      <header className="package-header">
        <h1>
          <span className="tenant-name">{tenant}</span>
          {' / '}
          <span className="package-name">{pkg}</span>
        </h1>
      </header>
      
      <main className="package-content">
        {/* Package home component will be rendered here */}
        <div className="placeholder">
          <p>Package: <strong>{pkg}</strong></p>
          <p>Tenant: <strong>{tenant}</strong></p>
          <p>
            This page will render the package&apos;s home component.
          </p>
          
          <h2>API Endpoints</h2>
          <code>
            <pre>{`
GET    /api/v1/${tenant}/${pkg}/{entity}         # List
GET    /api/v1/${tenant}/${pkg}/{entity}/{id}    # Read
POST   /api/v1/${tenant}/${pkg}/{entity}         # Create
PUT    /api/v1/${tenant}/${pkg}/{entity}/{id}    # Update
DELETE /api/v1/${tenant}/${pkg}/{entity}/{id}    # Delete
POST   /api/v1/${tenant}/${pkg}/{entity}/{id}/{action}  # Custom
            `.trim()}</pre>
          </code>
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: PackagePageProps) {
  const { tenant, package: pkg } = await params
  
  return {
    title: `${pkg} - ${tenant} | MetaBuilder`,
    description: `${pkg} package for tenant ${tenant}`,
  }
}
