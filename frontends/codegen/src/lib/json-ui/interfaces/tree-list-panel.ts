import type { ComponentTree } from '@/types/project'

export interface TreeListPanelProps {
  trees: ComponentTree[]
  selectedTreeId: string | null
  onTreeSelect: (treeId: string) => void
  onTreeEdit: (tree: ComponentTree) => void
  onTreeDuplicate: (tree: ComponentTree) => void
  onTreeDelete: (treeId: string) => void
  onCreateNew: () => void
  onImportJson: () => void
  onExportJson: () => void
}
