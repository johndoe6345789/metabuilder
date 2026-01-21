import pagesConfig from './pages.json'
import { PageConfig } from '@/types/page-config'

export function getPageById(id: string): PageConfig | undefined {
  console.log('[CONFIG] 🔍 getPageById called for:', id)
  const page = pagesConfig.pages.find(page => page.id === id)
  console.log('[CONFIG]', page ? '✅ Page found' : '❌ Page not found')
  return page as PageConfig | undefined
}
