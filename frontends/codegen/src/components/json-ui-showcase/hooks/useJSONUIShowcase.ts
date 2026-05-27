/**
 * useJSONUIShowcase — state and computed examples list.
 */
import { useMemo, useState } from 'react'
import showcaseCopy from '@/config/ui-examples/showcase.json'
import {
  FileCode,
  ChartBar,
  ListBullets,
  Table,
  Gear,
  Clock,
} from '@metabuilder/fakemui/icons'
import type { ShowcaseExample } from '../types'

const exampleIcons = {
  ChartBar,
  ListBullets,
  Table,
  Clock,
  Gear,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const webpackRequire = require as any
const configContext = webpackRequire.context(
  '@/config/ui-examples',
  false,
  /\.json$/,
) as __WebpackModuleApi.RequireContext
const configModules: Record<string, unknown> = {}
for (const key of configContext.keys()) {
  configModules[
    `/src/config/ui-examples${key.slice(1)}`
  ] = configContext(key)
}

const resolveExampleConfig = (configPath: string) => {
  const moduleEntry = configModules[configPath] as
    | { default: ShowcaseExample['config'] }
    | undefined
  return moduleEntry?.default ?? {}
}

export interface JSONUIShowcaseState {
  selectedExample: string
  setSelectedExample: (key: string) => void
  showJSON: boolean
  setShowJSON: (show: boolean) => void
  examples: ShowcaseExample[]
  copy: typeof showcaseCopy
}

export function useJSONUIShowcase(): JSONUIShowcaseState {
  const [selectedExample, setSelectedExample] = useState(
    showcaseCopy.defaultExampleKey,
  )
  const [showJSON, setShowJSON] = useState(false)

  const examples = useMemo<ShowcaseExample[]>(() => {
    return showcaseCopy.examples.map((example) => {
      const icon =
        exampleIcons[
          example.iconId as keyof typeof exampleIcons
        ] || FileCode
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

  return {
    selectedExample,
    setSelectedExample,
    showJSON,
    setShowJSON,
    examples,
    copy: showcaseCopy,
  }
}
