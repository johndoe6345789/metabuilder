import { useCallback, useState } from 'react'
import type { useAppDispatch } from '@/store/hooks'
import { saveTree } from '@/lib/tenant/page-tree'
import { clearDirty } from '@/store/slices/god-slice'
import { snapshot } from '@/lib/persist/versions'
import type { TreeNode } from '../builder-registry'
import { DBAL, findRowForPath, pageId } from './find-row-for-path'
import { writePageRow } from './write-page-row'
import { DEFAULT_PUBLISH_TARGET, type PublishTarget } from './types'

export function usePublishPage(
  tree: TreeNode,
  dispatch: ReturnType<typeof useAppDispatch>
) {
  const [publishing, setPublishing] = useState(false)
  /** Why the last publish was refused, if it was. */
  const [conflict, setConflict] = useState<string | null>(null)

  const publish = useCallback(
    async (
      target: PublishTarget = DEFAULT_PUBLISH_TARGET
    ): Promise<boolean> => {
      const { tenant, path } = target
      setPublishing(true)
      try {
        // "path" carries a UNIQUE index, so a path can only ever have one
        // row. Taking a page over therefore means repointing whichever row
        // already owns the path -- posting a second one just 409s. Its id and
        // packageId are preserved, so restoring the original is a matter of
        // putting `component` back and clearing `componentTree`.
        const owner = await findRowForPath(tenant, path)
        const id = owner?.id ?? pageId(tenant, path)

        setConflict(
          owner === null || owner.component === 'component_tree'
            ? null
            : `Taking over "${path}" from ${owner.packageId ?? 'a package'} ` +
                `(was rendering "${owner.component ?? '?'}"). Restore it by ` +
                'setting that component back and clearing the tree.'
        )

        const treeId = `tree_${id}`
        const stamp = Date.now()
        const wrote = await saveTree(
          DBAL,
          tenant,
          treeId,
          target.title,
          tree,
          `Published from the God Panel for ${path}`
        )
        if (!wrote) return false

        const res = await writePageRow(owner, id, target, treeId, stamp)
        if (!res.ok) return false

        await snapshot('god.componentTree', tree, 'Published page')
        dispatch(clearDirty('tree'))
        return true
      } catch {
        return false
      } finally {
        setPublishing(false)
      }
    },
    [tree, dispatch]
  )

  return { publish, publishing, conflict }
}
