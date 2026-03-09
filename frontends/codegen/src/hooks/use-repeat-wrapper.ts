import { useMemo } from 'react'

interface UseRepeatWrapperArgs {
  items: any[]
  render: (item: any, index: number) => React.ReactNode
}

export function useRepeatWrapper({ items, render }: UseRepeatWrapperArgs) {
  const rendered = useMemo(() => {
    if (!items || items.length === 0) {
      return []
    }
    return items.map((item, index) => ({
      key: index,
      item,
      index,
      element: render(item, index)
    }))
  }, [items, render])

  return {
    renderedItems: rendered,
    itemCount: items?.length || 0,
    isEmpty: !items || items.length === 0
  }
}
