/**
 * The files Nerd Mode shows: the JSON behind what the founder has built.
 *
 * The explorer listed `src/workflow.json`, `src/config.json` and
 * `src/styles.css` -- three names that referred to nothing -- and opening
 * one set `content: ''`, so the editor was always empty. The panel
 * already holds the real things those names describe: the page tree, the
 * stylesheet and the workflow open in the Workflows tab.
 */

import { styleSheetText } from '@/lib/tenant/style-classes/style-sheet-text'
import { pickEntry } from '@/store/slices/god-slice/workflow-entry'
import type { GodState } from '@/store/slices/god-slice'
import type { FileNode, OpenFile } from './ide-types'

export const PROJECT_FOLDER = 'this community'

const sheetOrHint = (css: string): string =>
  css === ''
    ? '/* No style classes yet — make one in the Styles tab. */'
    : css

/** The three artefacts, by the path the explorer shows them under. */
export function projectFiles(
  god: GodState,
  tenant: string
): Record<string, OpenFile> {
  const entries = god.workflows?.[tenant] ?? []
  const workflow = pickEntry(entries, god.workflowSelected?.[tenant])
  return {
    [`${PROJECT_FOLDER}/page-tree.json`]: {
      path: `${PROJECT_FOLDER}/page-tree.json`,
      language: 'json',
      content: JSON.stringify(god.tree, null, 2),
    },
    [`${PROJECT_FOLDER}/styles.css`]: {
      path: `${PROJECT_FOLDER}/styles.css`,
      language: 'css',
      content: sheetOrHint(styleSheetText(god.css)),
    },
    [`${PROJECT_FOLDER}/workflow.json`]: {
      path: `${PROJECT_FOLDER}/workflow.json`,
      language: 'json',
      content:
        workflow === undefined
          ? '// No workflow open — pick one in the Workflows tab.'
          : JSON.stringify(workflow.workflow, null, 2),
    },
  }
}

/** The explorer's tree for those files. */
export function projectTree(files: Record<string, OpenFile>): FileNode[] {
  return [
    {
      name: PROJECT_FOLDER,
      type: 'folder',
      children: Object.values(files).map(file => ({
        name: file.path.slice(PROJECT_FOLDER.length + 1),
        type: 'file' as const,
        language: file.language,
      })),
    },
  ]
}
