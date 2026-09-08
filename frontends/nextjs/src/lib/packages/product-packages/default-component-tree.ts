import type { TreeNodeShape } from '@/lib/tenant/page-tree'

/**
 * The starter page a package's route gets, written to PageTreeNode and
 * PageTreeProp rows rather than stored as a document.
 *
 * It used to return `Record<string, unknown>` and reach saveTree through
 * `as unknown as TreeNodeShape`, which asserted three untrue things at
 * once. Only the root had an `id`, so collectRows threw on the first child
 * and every package install reported "Failed to install" after the
 * registry had already recorded it as installed. "Box" and "Typography"
 * are not block types here, so had it saved, the page would have rendered
 * "Unknown block" three times. And the text nodes carried `content`, while
 * the text block reads `text`.
 *
 * Typed properly now, so the registry and the row writer are the ones
 * saying whether this is valid.
 */
export function defaultComponentTree(title: string): TreeNodeShape {
  return {
    id: 'root',
    type: 'container',
    props: { direction: 'column', gap: 12 },
    children: [
      {
        id: 'title',
        type: 'heading',
        props: { text: title },
        children: [],
      },
      {
        id: 'intro',
        type: 'text',
        props: {
          text: 'Customise this page in the God Panel → Components.',
        },
        children: [],
      },
    ],
  }
}
