import type {
  PackageContent,
  PackageManifest,
} from '@/lib/packages/core/package-types'

/** id + a display label captured at search-select time, so the "Package
 * contents" list can render readable names without re-fetching each
 * referenced row on every draft render. Only `id` is sent to DBAL on
 * publish -- `label` is UI-only. */
export interface PackageRef {
  id: string
  label: string
}

/**
 * A package bundles a route→component-tree→workflow pipeline plus styles and
 * assets. `archived` soft-disables it (keeps references intact) instead of
 * deleting. Persisted in the Redux god slice as a working draft; `content`
 * is unused so far (kept for a future richer bundle shape) -- the
 * references a package actually composes today live in the three fields
 * below, flattened to bare id arrays and sent to the real GodPackage DBAL
 * entity on publish.
 */
export interface RegistryPackage {
  manifest: PackageManifest
  content: PackageContent
  archived: boolean
  workflows: PackageRef[]
  pageConfigs: PackageRef[]
  themeId: string | null
  /** Set once publish() succeeds; lets the UI show "published" vs. "draft". */
  publishedId: string | null
}
