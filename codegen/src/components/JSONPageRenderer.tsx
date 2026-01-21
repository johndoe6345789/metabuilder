import pageRendererCopy from '@/config/json-page-renderer.json'
import { PageSectionRenderer } from '@/components/json-page-renderer/SectionRenderer'
import { ComponentRendererProps } from '@/components/json-page-renderer/types'

export function JSONPageRenderer({
  config,
  schema,
  data = {},
  functions = {},
}: ComponentRendererProps) {
  const pageSchema = config || schema
  if (!pageSchema) {
    return <div>{pageRendererCopy.fallbackText}</div>
  }

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      {pageSchema.layout.sections?.map((section, index) => (
        <PageSectionRenderer
          key={index}
          index={index}
          section={section}
          pageSchema={pageSchema}
          data={data}
          functions={functions}
        />
      ))}
    </div>
  )
}

export type { ComponentRendererProps } from '@/components/json-page-renderer/types'
