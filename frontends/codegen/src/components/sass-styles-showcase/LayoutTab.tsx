import { Card, CardContent, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { TabPanel } from '@metabuilder/fakemui/navigation'
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
    <TabPanel value={value}>
      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
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
    </TabPanel>
  )
}
