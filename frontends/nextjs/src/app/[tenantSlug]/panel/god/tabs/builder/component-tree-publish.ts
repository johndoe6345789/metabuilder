'use client'

import { useAppDispatch } from '@/store/hooks'
import type { TreeNode } from './builder-registry'
import { usePublishPage } from './component-tree-publish/use-publish-page'
import { useLoadPage } from './component-tree-publish/use-load-page'

export type { PublishTarget } from './component-tree-publish/types'
export { DEFAULT_PUBLISH_TARGET } from './component-tree-publish/types'

export function useComponentTreePublish(tree: TreeNode) {
  const dispatch = useAppDispatch()
  const { publish, publishing, conflict } = usePublishPage(tree, dispatch)
  const { load, loading } = useLoadPage(dispatch)

  return { publish, publishing, conflict, load, loading }
}
