/** The starter tree a package's route gets, as a node. Written to
 *  PageTreeNode/PageTreeProp rows, never stored as a document. */
export function defaultComponentTree(title: string): Record<string, unknown> {
  return {
    id: 'root',
    type: 'Box',
    props: {},
    children: [
      {
        type: 'Typography',
        props: { variant: 'h4' },
        children: [{ type: 'text', props: { content: title } }],
      },
      {
        type: 'Typography',
        props: { variant: 'body1' },
        children: [
          {
            type: 'text',
            props: {
              content: 'Customise this page in the God Panel → Pages.',
            },
          },
        ],
      },
    ],
  }
}
