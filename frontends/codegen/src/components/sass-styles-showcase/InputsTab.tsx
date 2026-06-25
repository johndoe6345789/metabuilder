import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/m3/surfaces'
import { TabPanel } from '@metabuilder/m3/navigation'
import { type InputsTabData } from './types'

type InputsTabProps = {
  data: InputsTabData
  value: string
}

export function InputsTab({ data, value }: InputsTabProps) {
  return (
    <TabPanel value={value}>
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
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
    </TabPanel>
  )
}
