import { JSONUIRenderer } from '@/lib/json-ui/renderer'
import type { UIComponent } from '@/lib/json-ui/schema'
import { useJSONUIPage } from './hooks/useJSONUIPage'

interface JSONUIPageProps {
  jsonConfig: any
}

export function JSONUIPage({
  jsonConfig,
}: JSONUIPageProps) {
  const { dataMap, handleAction } =
    useJSONUIPage(jsonConfig)

  if (!jsonConfig.layout) {
    return <div>No layout defined</div>
  }

  const layoutComponent: UIComponent = {
    id:
      jsonConfig.layout.type || 'root-layout',
    type: 'div',
    className: jsonConfig.layout.className,
    style: {
      display:
        jsonConfig.layout.type === 'flex'
          ? 'flex'
          : 'block',
      flexDirection:
        jsonConfig.layout.direction === 'column'
          ? 'column'
          : 'row',
      gap: jsonConfig.layout.gap
        ? `${jsonConfig.layout.gap * 0.25}rem`
        : undefined,
      padding: jsonConfig.layout.padding
        ? `${jsonConfig.layout.padding * 0.25}rem`
        : undefined,
    },
    children: jsonConfig.layout.children || [],
  }

  return (
    <div>
      <JSONUIRenderer
        component={layoutComponent}
        dataMap={dataMap}
        onAction={handleAction}
      />
    </div>
  )
}
