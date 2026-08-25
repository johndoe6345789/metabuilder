'use client'

import { Button } from '@/m3'
import { BASE_PATH } from '@/lib/app-config'
import s from './ComponentTreeTab.module.scss'

type Props = {
  dirty: boolean
  publishing: boolean
  onPublish: () => void
  /** Route being edited, e.g. "/tree-demo". */
  path: string
  /** Tenant the page belongs to; always present in an authenticated URL. */
  tenant: string
}

/**
 * Where a published tree is served. Signed in, the tenant is always in the
 * path: /app/{tenant}/{route}. Both /{tenant}/{page} and deeper paths fall
 * back to the PageConfig row when the segment is not a filesystem package.
 */
export function pagePreviewHref(tenant: string, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${BASE_PATH}/${encodeURIComponent(tenant)}${clean}`
}

export function ComponentTreePublishBar({
  dirty,
  publishing,
  onPublish,
  path,
  tenant,
}: Props) {
  return (
    <div className={s.publishBar}>
      {dirty ? <span className={s.dot} /> : null}
      <span className={`${s.status} ${dirty ? '' : s.clean}`}>
        {dirty
          ? 'Staged changes — not yet published'
          : 'Published — up to date'}
      </span>
      <span className={s.spacer} />
      <Button
        variant="outlined"
        size="small"
        disabled={path.trim().length === 0}
        // Shows what is published, not what is staged -- the live preview
        // pane beside the tree is the working copy.
        title={
          dirty
            ? 'Opens the published page; staged changes are not in it yet'
            : 'Open the published page'
        }
        onClick={() => {
          window.open(pagePreviewHref(tenant, path), '_blank', 'noopener')
        }}
      >
        ↗ Preview
      </Button>
      <Button
        variant="contained"
        size="small"
        disabled={!dirty || publishing}
        onClick={onPublish}
      >
        {publishing ? 'Publishing…' : '⇧ Publish'}
      </Button>
    </div>
  )
}
