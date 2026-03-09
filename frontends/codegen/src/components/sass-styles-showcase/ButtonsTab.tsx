import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { TabPanel } from '@metabuilder/fakemui/navigation'
import { type ButtonsTabData } from './types'

type ButtonsTabProps = {
  data: ButtonsTabData
  value: string
}

export function ButtonsTab({ data, value }: ButtonsTabProps) {
  return (
    <TabPanel value={value}>
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
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
    </TabPanel>
  )
}
