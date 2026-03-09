import { usePathname, useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useRouterNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const currentPath = pathname.replace(/^\/codegen\/?/, '') || 'home'

  const navigateToPage = useCallback((pageId: string) => {
    const path = pageId === 'home' ? '/codegen' : `/codegen/${pageId}`
    router.push(path)
  }, [router])

  return {
    currentPage: currentPath,
    navigateToPage,
  }
}
