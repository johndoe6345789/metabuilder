import type { UIComponent } from '@/types/json-ui'

export interface ComponentTreeProps {
  components?: UIComponent[]
  selectedId?: string | null
  emptyMessage?: string
  onSelect?: (id: string) => void
  className?: string
}
