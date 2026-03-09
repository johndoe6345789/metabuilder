import pagesConfig from './pages.json'
import { PageConfig } from '@/types/page-config'

export function getPageById(id: string): PageConfig | undefined {
  const page = pagesConfig.pages.find(page => page.id === id)
  return page as PageConfig | undefined
}
