import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { TabPanel } from '@metabuilder/fakemui/navigation'
import { type AnimationsTabData } from './types'

type AnimationsTabProps = {
  data: AnimationsTabData
  value: string
}

export function AnimationsTab({ data, value }: AnimationsTabProps) {
  return (
    <TabPanel value={value}>
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardContent>
          <div>
            {data.skeletonClasses.map((className, index) => (
              <div key={`skeleton-${index}`} className={className} />
            ))}
          </div>
        </CardContent>
      </Card>
    </TabPanel>
  )
}
