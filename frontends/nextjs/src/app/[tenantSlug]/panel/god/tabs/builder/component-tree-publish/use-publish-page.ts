import { useCallback, useState } from 'react'
import type { useAppDispatch } from '@/store/hooks'
import { saveTree } from '@/lib/tenant/page-tree'
import { describeFailure } from '@/lib/tenant/page-tree/write-failure'
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
  /** Why the last publish took a path over from a package, if it did. */
  const [conflict, setConflict] = useState<string | null>(null)
  /**
   * Why the last publish failed, in the server's words. Without this a
   * refused publish looked exactly like one never attempted -- the bar just
   * kept reading "Staged changes -- not yet published".
   */
  const [error, setError] = useState<string | null>(null)

  const publish = useCallback(
    async (
      target: PublishTarget = DEFAULT_PUBLISH_TARGET,
      /**
       * The tree to publish, when the caller has just computed one and must
       * not wait for it to come back through Redux. BQL needs this: it
       * builds a tree and publishes it in the same turn, and the `tree`
       * closed over here is still the previous render's.
       */
      override?: TreeNode
    ): Promise<boolean> => {
      const treeToPublish = override ?? tree
      const { tenant, path } = target
      setPublishing(true)
      setError(null)
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
        const failure = await saveTree(
          DBAL,
          tenant,
          treeId,
          target.title,
          treeToPublish,
          `Published from the God Panel for ${path}`
        )
        if (failure !== null) {
          setError(failure)
          return false
        }

        const res = await writePageRow(owner, id, target, treeId, stamp)
        if (!res.ok) {
          setError(await describeFailure('PageConfig', res))
          return false
        }

        await snapshot('god.componentTree', treeToPublish, 'Published page')
        dispatch(clearDirty('tree'))
        return true
      } catch (cause) {
        setError(
          cause instanceof Error
            ? `Could not reach the server: ${cause.message}`
            : 'Could not reach the server.'
        )
        return false
      } finally {
        setPublishing(false)
      }
    },
    [tree, dispatch]
  )

  return { publish, publishing, conflict, error }
}
