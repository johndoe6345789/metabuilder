'use client'

/** The heavy blocks, lazy-loaded so tenant pages only pull them when a
 * tree actually uses one. */

import dynamic from 'next/dynamic'

export const loading = () => <span style={{ opacity: 0.5 }}>Loading…</span>
export const Webchat = dynamic(
  () =>
    import('@/components/webchat/Webchat').then(m => ({ default: m.Webchat })),
  { ssr: false, loading }
)
export const WorkflowEditorBlock = dynamic(
  () =>
    import('@/app/[tenantSlug]/panel/god/blocks/metabuilder-blocks').then(
      m => ({ default: m.WorkflowEditorBlock })
    ),
  { ssr: false, loading }
)
export const PackageManagerBlock = dynamic(
  () =>
    import('@/app/[tenantSlug]/panel/god/blocks/metabuilder-blocks').then(
      m => ({ default: m.PackageManagerBlock })
    ),
  { ssr: false, loading }
)
export const SchemaEditorBlock = dynamic(
  () =>
    import('@/app/[tenantSlug]/panel/god/blocks/metabuilder-blocks').then(
      m => ({ default: m.SchemaEditorBlock })
    ),
  { ssr: false, loading }
)

// Fire the wired workflow when a bound button is clicked (route→tree→workflow).
