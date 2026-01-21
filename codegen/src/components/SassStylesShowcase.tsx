import showcaseData from '@/data/sass-styles-showcase.json'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AnimationsTab } from '@/components/sass-styles-showcase/AnimationsTab'
import { ButtonsTab } from '@/components/sass-styles-showcase/ButtonsTab'
import { CardsTab } from '@/components/sass-styles-showcase/CardsTab'
import { ChipsTab } from '@/components/sass-styles-showcase/ChipsTab'
import { InputsTab } from '@/components/sass-styles-showcase/InputsTab'
import { LayoutTab } from '@/components/sass-styles-showcase/LayoutTab'
import { type SassStylesShowcaseData } from '@/components/sass-styles-showcase/types'

const data = showcaseData as SassStylesShowcaseData

const tabContent = {
  buttons: ButtonsTab,
  inputs: InputsTab,
  cards: CardsTab,
  chips: ChipsTab,
  layout: LayoutTab,
  animations: AnimationsTab,
}

export function SassStylesShowcase() {
  return (
    <div className="h-full p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{data.page.title}</h1>
        <p className="text-muted-foreground">{data.page.description}</p>
      </div>

      <Tabs defaultValue={data.tabOrder[0]} className="flex-1">
        <TabsList className="h-auto flex-wrap">
          {data.tabOrder.map((tabKey) => (
            <TabsTrigger key={tabKey} value={tabKey}>
              {data.tabs[tabKey].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {data.tabOrder.map((tabKey) => {
          const TabComponent = tabContent[tabKey]

          return <TabComponent key={tabKey} data={data.tabs[tabKey]} value={tabKey} />
        })}
      </Tabs>
    </div>
  )
}
