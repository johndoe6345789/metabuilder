import { useKVState } from '../core/use-kv-state'

interface LayoutState {
  panelSizes?: number[]
  collapsed?: Record<string, boolean>
  activePanel?: string
}

export function useLayoutState(pageId: string) {
  const [layoutState, setLayoutState] = useKVState<LayoutState>(
    `layout-state:${pageId}`,
    {}
  )

  const setPanelSizes = (sizes: number[]) => {
    setLayoutState((prev) => ({ ...prev, panelSizes: sizes }))
  }

  const setCollapsed = (panelId: string, collapsed: boolean) => {
    setLayoutState((prev) => ({
      ...prev,
      collapsed: { ...(prev.collapsed || {}), [panelId]: collapsed },
    }))
  }

  const setActivePanel = (panelId: string) => {
    setLayoutState((prev) => ({ ...prev, activePanel: panelId }))
  }

  return {
    layoutState,
    setPanelSizes,
    setCollapsed,
    setActivePanel,
  }
}
