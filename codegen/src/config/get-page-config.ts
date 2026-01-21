import pagesConfig from './pages.json'
import { PagesConfig } from '@/types/pages-config'

export function getPageConfig(): PagesConfig {
  console.log('[CONFIG] 📄 getPageConfig called')
  const config = pagesConfig as PagesConfig
  console.log('[CONFIG] ✅ Pages config loaded:', config.pages.length, 'pages')
  return config
}
