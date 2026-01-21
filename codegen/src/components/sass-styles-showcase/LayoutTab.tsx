import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TabsContent } from '@/components/ui/tabs'
import { type LayoutSection, type LayoutTabData } from './types'

type LayoutTabProps = {
  data: LayoutTabData
  value: string
}

const renderSectionItems = (section: LayoutSection) => {
  const ItemTag = section.itemTag ?? 'div'

  return section.items.map((item) => (
    <ItemTag key={item.label} className={item.className}>
      {item.label}
    </ItemTag>
  ))
}

export function LayoutTab({ data, value }: LayoutTabProps) {
  return (
    <TabsContent value={value} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <div className={section.containerClassName}>
                {renderSectionItems(section)}
              </div>
            </div>
          ))}

          <div className="mt-4">
            <pre className="custom-mui-code-block">{data.codeSample}</pre>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
