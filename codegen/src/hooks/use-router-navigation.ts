import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useCallback } from 'react'

console.log('[USE_ROUTER_NAVIGATION] 🧭 Hook module loading')

export function useRouterNavigation() {
  console.log('[USE_ROUTER_NAVIGATION] 🔧 Initializing hook')
  const location = useLocation()
  const navigate = useNavigate()

  const currentPath = location.pathname.replace('/', '') || 'dashboard'
  console.log('[USE_ROUTER_NAVIGATION] 📍 Current path:', currentPath)

  const navigateToPage = useCallback((pageId: string) => {
    console.log('[USE_ROUTER_NAVIGATION] 🚀 Navigating to:', pageId)
    navigate(`/${pageId}`)
  }, [navigate])

  useEffect(() => {
    console.log('[USE_ROUTER_NAVIGATION] 📡 Location changed to:', location.pathname)
  }, [location])

  return {
    currentPage: currentPath,
    navigateToPage
  }
}
