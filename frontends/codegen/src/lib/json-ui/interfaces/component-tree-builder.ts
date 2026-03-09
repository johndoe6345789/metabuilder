import { ComponentNode } from '@/types/project'

export interface ComponentTreeBuilderProps {
  components: ComponentNode[]
  onComponentsChange: (components: ComponentNode[]) => void
}
