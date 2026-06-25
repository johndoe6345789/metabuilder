import { CheckCircle } from '@metabuilder/m3/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/m3/surfaces'
import { TabPanel } from '@metabuilder/m3/navigation'
import { type ChipsTabData } from './types'

type ChipsTabProps = {
  data: ChipsTabData
  value: string
}

export function ChipsTab({ data, value }: ChipsTabProps) {
  return (
    <TabPanel value={value}>
      <Card>
        <CardHeader>
          <CardTitle>{data.chipCardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {data.chips.map((chip) => (
              <span key={chip.label} className={chip.className}>
                {chip.showIcon ? <CheckCircle size={14} weight="fill" /> : null}
                {chip.label}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <pre className="custom-mui-code-block">{data.codeSample}</pre>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{data.tagCardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {data.tags.map((tag) => (
              <span key={tag.label} className={tag.className}>
                {tag.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabPanel>
  )
}
