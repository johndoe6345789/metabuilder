'use client'

import { renderNode } from '../builder-registry'
import type { TreeNode } from '../builder-registry'
import s from '../ComponentTreeTab.module.scss'

export function PreviewPane({ tree }: { tree: TreeNode }) {
  return (
    <section className={s.previewWrap}>
      <div className={s.paneTitle}>Live preview</div>
      <div className={s.preview}>{renderNode(tree)}</div>
    </section>
  )
}
