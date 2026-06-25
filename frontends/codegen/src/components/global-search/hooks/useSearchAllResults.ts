/**
 * useSearchAllResults
 *
 * Builds the full unsorted search result list from
 * all project entities and navigation items.
 */

import { useMemo } from 'react'
import {
  BookOpen,
  Code,
  Cube,
  Database,
  File,
  FlowArrow,
  Folder,
  Play,
  Tree,
} from '@metabuilder/m3/icons'
import type {
  ComponentNode,
  ComponentTree,
  Lambda,
  PlaywrightTest,
  DbModel,
  ProjectFile,
  StorybookStory,
  UnitTest,
  Workflow,
} from '@/types/project'
import navigationData from '@/data/global-search.json'
import type { SearchResult } from '../types'
import {
  navigationIconMap,
  type NavigationMeta,
} from './navigationIconMap'

interface UseSearchAllResultsArgs {
  files: ProjectFile[]
  models: DbModel[]
  components: ComponentNode[]
  componentTrees: ComponentTree[]
  workflows: Workflow[]
  lambdas: Lambda[]
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  onNavigate: (
    tab: string,
    itemId?: string
  ) => void
  onFileSelect: (fileId: string) => void
}

export function useSearchAllResults({
  files,
  models,
  components,
  componentTrees,
  workflows,
  lambdas,
  playwrightTests,
  storybookStories,
  unitTests,
  onNavigate,
  onFileSelect,
}: UseSearchAllResultsArgs): SearchResult[] {
  return useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = []

    const navResults = (
      navigationData as NavigationMeta[]
    ).map((item) => {
      const Icon = navigationIconMap[item.icon]
      return {
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        category: item.category,
        icon: <Icon size={18} weight="duotone" />,
        action: () => onNavigate(item.tab),
        tags: item.tags,
      }
    })
    results.push(...navResults)

    files.forEach((f) =>
      results.push({
        id: `file-${f.id}`,
        title: f.name,
        subtitle: f.path,
        category: 'Files',
        icon: <File size={18} weight="duotone" />,
        action: () => {
          onNavigate('code')
          onFileSelect(f.id)
        },
        tags: [f.language, f.path, 'code'],
      })
    )

    models.forEach((m) =>
      results.push({
        id: `model-${m.id}`,
        title: m.name,
        subtitle: `${m.fields.length} fields`,
        category: 'Models',
        icon: (
          <Database size={18} weight="duotone" />
        ),
        action: () => onNavigate('models', m.id),
        tags: [
          'database',
          'schema',
          m.name.toLowerCase(),
        ],
      })
    )

    components.forEach((c) =>
      results.push({
        id: `component-${c.id}`,
        title: c.name,
        subtitle: c.type,
        category: 'Components',
        icon: <Tree size={18} weight="duotone" />,
        action: () =>
          onNavigate('components', c.id),
        tags: [
          'react',
          c.type.toLowerCase(),
          c.name.toLowerCase(),
        ],
      })
    )

    componentTrees.forEach((t) =>
      results.push({
        id: `tree-${t.id}`,
        title: t.name,
        subtitle:
          t.description ||
          `${t.rootNodes.length} root nodes`,
        category: 'Component Trees',
        icon: (
          <Folder size={18} weight="duotone" />
        ),
        action: () =>
          onNavigate('component-trees', t.id),
        tags: [
          'hierarchy',
          'structure',
          t.name.toLowerCase(),
        ],
      })
    )

    workflows.forEach((w) =>
      results.push({
        id: `workflow-${w.id}`,
        title: w.name,
        subtitle:
          w.description ||
          `${w.nodes.length} nodes`,
        category: 'Workflows',
        icon: (
          <FlowArrow size={18} weight="duotone" />
        ),
        action: () =>
          onNavigate('workflows', w.id),
        tags: [
          'automation',
          'flow',
          w.name.toLowerCase(),
        ],
      })
    )

    lambdas.forEach((l) =>
      results.push({
        id: `lambda-${l.id}`,
        title: l.name,
        subtitle: l.description || l.runtime,
        category: 'Lambdas',
        icon: <Code size={18} weight="duotone" />,
        action: () => onNavigate('lambdas', l.id),
        tags: [
          'serverless',
          l.runtime,
          l.name.toLowerCase(),
        ],
      })
    )

    playwrightTests.forEach((t) =>
      results.push({
        id: `playwright-${t.id}`,
        title: t.name,
        subtitle: t.description,
        category: 'Playwright Tests',
        icon: (
          <Play size={18} weight="duotone" />
        ),
        action: () =>
          onNavigate('playwright', t.id),
        tags: ['testing', 'e2e', t.name.toLowerCase()],
      })
    )

    storybookStories.forEach((s) =>
      results.push({
        id: `storybook-${s.id}`,
        title: s.storyName,
        subtitle: s.componentName,
        category: 'Storybook Stories',
        icon: (
          <BookOpen size={18} weight="duotone" />
        ),
        action: () =>
          onNavigate('storybook', s.id),
        tags: [
          'documentation',
          'story',
          s.componentName.toLowerCase(),
        ],
      })
    )

    unitTests.forEach((t) =>
      results.push({
        id: `unit-test-${t.id}`,
        title: t.name,
        subtitle: t.description,
        category: 'Unit Tests',
        icon: <Cube size={18} weight="duotone" />,
        action: () =>
          onNavigate('unit-tests', t.id),
        tags: [
          'testing',
          'unit',
          t.name.toLowerCase(),
        ],
      })
    )

    return results
  }, [
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    onNavigate,
    onFileSelect,
  ])
}
