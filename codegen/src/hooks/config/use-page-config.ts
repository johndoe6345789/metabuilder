import { useKVState } from '../core/use-kv-state'
import { PageConfig, PageConfigSchema } from '@/config/page-schema'
import defaultPagesData from '@/config/default-pages.json'

const defaultPages = defaultPagesData as { pages: PageConfig[] }

export function usePageConfig(pageId: string) {
  const defaultPage = defaultPages.pages.find((p) => p.id === pageId)
  
  const [pageConfig, setPageConfig] = useKVState<PageConfig | null>(
    `page-config:${pageId}`,
    defaultPage || null,
    PageConfigSchema.nullable()
  )

  return {
    pageConfig: pageConfig || defaultPage || null,
    setPageConfig,
  }
}

export function usePageRegistry() {
  const [pages, setPages] = useKVState<PageConfig[]>(
    'page-registry',
    defaultPages.pages,
  )

  return {
    pages: pages || [],
    setPages,
    getPage: (id: string) => (pages || []).find((p) => p.id === id),
  }
}
