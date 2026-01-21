import { useMemo, useState } from 'react'
import showcaseCopy from '@/config/ui-examples/showcase.json'
import { FileCode, ChartBar, ListBullets, Table, Gear, Clock } from '@phosphor-icons/react'
import { ShowcaseHeader } from '@/components/json-ui-showcase/ShowcaseHeader'
import { ShowcaseTabs } from '@/components/json-ui-showcase/ShowcaseTabs'
import { ShowcaseFooter } from '@/components/json-ui-showcase/ShowcaseFooter'
import { ShowcaseExample } from '@/components/json-ui-showcase/types'

const exampleIcons = {
  ChartBar,
  ListBullets,
  Table,
  Clock,
  Gear,
}

const configModules = import.meta.glob('/src/config/ui-examples/*.json', { eager: true })

const resolveExampleConfig = (configPath: string) => {
  const moduleEntry = configModules[configPath] as { default: ShowcaseExample['config'] } | undefined

  return moduleEntry?.default ?? {}
}

export function JSONUIShowcase() {
  const [selectedExample, setSelectedExample] = useState(showcaseCopy.defaultExampleKey)
  const [showJSON, setShowJSON] = useState(false)

  const examples = useMemo<ShowcaseExample[]>(() => {
    return showcaseCopy.examples.map((example) => {
      const icon = exampleIcons[example.iconId as keyof typeof exampleIcons] || FileCode
      const config = resolveExampleConfig(example.configPath)

      return {
        key: example.key,
        name: example.name,
        description: example.description,
        icon,
        config,
      }
    })
  }, [])

  return (
    <div className="h-full flex flex-col bg-background">
      <ShowcaseHeader copy={showcaseCopy.header} />

      <div className="flex-1 overflow-hidden">
        <ShowcaseTabs
          examples={examples}
          copy={showcaseCopy.tabs}
          selectedExample={selectedExample}
          onSelectedExampleChange={setSelectedExample}
          showJSON={showJSON}
          onShowJSONChange={setShowJSON}
        />
      </div>

      <ShowcaseFooter items={showcaseCopy.footer.items} />
    </div>
  )
}
