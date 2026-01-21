import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { type AnimationsTabData } from './types'

type AnimationsTabProps = {
  data: AnimationsTabData
  value: string
}

export function AnimationsTab({ data, value }: AnimationsTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.items.map((item) => (
              <div key={item.label} className={item.className}>
                {item.label}
              </div>
            ))}
          </div>

          <div className="mt-4">
            <pre className="custom-mui-code-block">{data.codeSample}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{data.skeletonTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.skeletonClasses.map((className, index) => (
              <div key={`skeleton-${index}`} className={className} />
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
