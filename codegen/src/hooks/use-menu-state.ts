import { usePopoverState } from './use-popover-state'
import type { MenuItem } from '@/lib/json-ui/interfaces/menu'

export function useMenuState() {
  const popoverState = usePopoverState()

  const handleItemClick = (item: MenuItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick()
      popoverState.close()
    }
  }

  return {
    ...popoverState,
    handleItemClick,
  }
}
