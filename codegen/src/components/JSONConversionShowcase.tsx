import { PageRenderer } from '@/lib/json-ui/page-renderer'
import conversionShowcaseSchema from '@/config/pages/json-conversion-showcase.json'
import { PageSchema } from '@/types/json-ui'

export function JSONConversionShowcase() {
  const schema = conversionShowcaseSchema as PageSchema

  return <PageRenderer schema={schema} />
}
