import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { type InputsTabData } from './types'

type InputsTabProps = {
  data: InputsTabData
  value: string
}

export function InputsTab({ data, value }: InputsTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {data.fields.map((field) => (
              <input
                key={field.placeholder}
                type="text"
                placeholder={field.placeholder}
                className={field.className}
              />
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
