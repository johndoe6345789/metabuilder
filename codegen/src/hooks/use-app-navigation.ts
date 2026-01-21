import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useRouterNavigation } from '@/hooks/use-router-navigation'

export default function useAppNavigation() {
  const location = useLocation()
  const { currentPage, navigateToPage } = useRouterNavigation()

  useEffect(() => {
    console.log('[APP_ROUTER] 📍 Route changed to:', location.pathname, '- Page:', currentPage)
  }, [currentPage, location.pathname])

  return { currentPage, navigateToPage }
}
