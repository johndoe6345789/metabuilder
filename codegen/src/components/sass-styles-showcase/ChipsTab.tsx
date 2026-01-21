import { CheckCircle } from '@phosphor-icons/react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { type ChipsTabData } from './types'

type ChipsTabProps = {
  data: ChipsTabData
  value: string
}

export function ChipsTab({ data, value }: ChipsTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.chipCardTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {data.tags.map((tag) => (
              <span key={tag.label} className={tag.className}>
                {tag.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
