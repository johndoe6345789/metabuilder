import pagesConfig from './pages.json'
import { PagesConfig } from '@/types/pages-config'

export function getPageConfig(): PagesConfig {
  const config = pagesConfig as PagesConfig
  return config
}
