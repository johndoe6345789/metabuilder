/** The params an entity route receives. */

export interface EntityPageProps {
  params: Promise<{
    tenantSlug: string
    package: string
    slug: string[]
  }>
}
