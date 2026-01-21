import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { type ButtonsTabData } from './types'

type ButtonsTabProps = {
  data: ButtonsTabData
  value: string
}

export function ButtonsTab({ data, value }: ButtonsTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.rows.map((row, rowIndex) => (
              <div key={`button-row-${rowIndex}`} className="flex gap-3 flex-wrap">
                {row.map((button) => (
                  <button key={button.label} className={button.className}>
                    {button.label}
                  </button>
                ))}
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
