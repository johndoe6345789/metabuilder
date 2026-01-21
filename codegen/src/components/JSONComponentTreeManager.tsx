import { PageRenderer } from '@/lib/json-ui/page-renderer'
import componentTreeSchema from '@/config/pages/component-tree.json'
import { PageSchema } from '@/types/json-ui'

interface JSONComponentTreeManagerProps {
  trees: any[]
  onTreesChange: (updater: (trees: any[]) => any[]) => void
}

export function JSONComponentTreeManager({ trees, onTreesChange }: JSONComponentTreeManagerProps) {
  const schema = componentTreeSchema as PageSchema

  const handleCustomAction = async (action: any, event?: any) => {
    console.log('[JSONComponentTreeManager] Custom action:', action, event)
  }

  return <PageRenderer schema={schema} onCustomAction={handleCustomAction} />
}
