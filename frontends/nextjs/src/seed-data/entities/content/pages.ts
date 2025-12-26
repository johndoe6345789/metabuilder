import { Database } from '@/lib/database'
import { getPageDefinitionBuilder } from '@/lib/rendering/page-definition-builder'

export async function initializePages() {
  const existingPages = await Database.getPages()
  if (existingPages.length > 0) {
    return
  }

  const builder = getPageDefinitionBuilder()
  await builder.initializeDefaultPages()
}
