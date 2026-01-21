import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { type CardsTabData } from './types'

type CardsTabProps = {
  data: CardsTabData
  value: string
}

export function CardsTab({ data, value }: CardsTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((item) => (
              <div key={item.title} className={item.className}>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className={item.descriptionClassName}>{item.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <pre className="custom-mui-code-block">{data.codeSample}</pre>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
