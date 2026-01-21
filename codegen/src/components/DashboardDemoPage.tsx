import { PageRenderer } from '@/lib/json-ui/page-renderer'
import { hydrateSchema } from '@/schemas/schema-loader'
import analyticsDashboardJson from '@/schemas/analytics-dashboard.json'

const dashboardSchema = hydrateSchema(analyticsDashboardJson)

export function DashboardDemoPage() {
  return <PageRenderer schema={dashboardSchema} />
}
