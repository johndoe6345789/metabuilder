import { useUIState } from '@/hooks/use-ui-state'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export interface NavigationHistoryItem {
  path: string
  title: string
  timestamp: number
}

const MAX_HISTORY_LENGTH = 10

export function useNavigationHistory() {
  const [history, setHistory] = useUIState<NavigationHistoryItem[]>('navigation-history', [])
  const pathname = usePathname()

  useEffect(() => {
    const pathSegments = pathname.replace(/^\/codegen\/?/, '').split('/').filter(Boolean)
    const pageName = pathSegments[0] || 'dashboard'
    
    const title = pageName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    const newItem: NavigationHistoryItem = {
      path: pathname,
      title,
      timestamp: Date.now(),
    }

    setHistory((currentHistory) => {
      const existingIndex = currentHistory.findIndex(item => item.path === newItem.path)
      
      if (existingIndex === 0) {
        return currentHistory
      }

      let updatedHistory = [...currentHistory]
      
      if (existingIndex > 0) {
        updatedHistory.splice(existingIndex, 1)
      }

      updatedHistory = [newItem, ...updatedHistory]

      return updatedHistory.slice(0, MAX_HISTORY_LENGTH)
    })
  }, [pathname, setHistory])

  const clearHistory = () => {
    setHistory([])
  }

  return {
    history,
    clearHistory,
  }
}
