import { useEffect, useMemo, useState } from 'react'
import { useKV } from '@/hooks/use-kv'
import {
  BookOpen,
  ChartBar,
  Code,
  Cube,
  Database,
  DeviceMobile,
  Faders,
  File,
  FileText,
  Flask,
  FlowArrow,
  Folder,
  Gear,
  Image,
  Lightbulb,
  PaintBrush,
  Play,
  Tree,
  Wrench,
} from '@phosphor-icons/react'
import {
  ComponentNode,
  ComponentTree,
  Lambda,
  PlaywrightTest,
  PrismaModel,
  ProjectFile,
  StorybookStory,
  UnitTest,
  Workflow,
} from '@/types/project'
import navigationData from '@/data/global-search.json'
import type { SearchHistoryItem, SearchResult } from './types'

const navigationIconMap = {
  BookOpen,
  ChartBar,
  Code,
  Cube,
  Database,
  DeviceMobile,
  Faders,
  FileText,
  Flask,
  FlowArrow,
  Gear,
  Image,
  Lightbulb,
  PaintBrush,
  Play,
  Tree,
  Wrench,
}

type NavigationIconName = keyof typeof navigationIconMap

interface NavigationMeta {
  id: string
  title: string
  subtitle: string
  category: string
  icon: NavigationIconName
  tab: string
  tags: string[]
}

interface UseGlobalSearchDataProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: ProjectFile[]
  models: PrismaModel[]
  components: ComponentNode[]
  componentTrees: ComponentTree[]
  workflows: Workflow[]
  lambdas: Lambda[]
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  onNavigate: (tab: string, itemId?: string) => void
  onFileSelect: (fileId: string) => void
}

export function useGlobalSearchData({
  open,
  onOpenChange,
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
}: UseGlobalSearchDataProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchHistory, setSearchHistory] = useKV<SearchHistoryItem[]>('search-history', [])

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
    }
  }, [open])

  const addToHistory = (query: string, result?: SearchResult) => {
    if (!query.trim()) return

    const historyItem: SearchHistoryItem = {
      id: `history-${Date.now()}`,
      query: query.trim(),
      timestamp: Date.now(),
      resultId: result?.id,
      resultTitle: result?.title,
      resultCategory: result?.category,
    }

    setSearchHistory((currentHistory) => {
      const filtered = (currentHistory || []).filter(
        (item) => item.query.toLowerCase() !== query.toLowerCase()
      )
      return [historyItem, ...filtered].slice(0, 20)
    })
  }

  const clearHistory = () => {
    setSearchHistory([])
  }

  const removeHistoryItem = (id: string) => {
    setSearchHistory((currentHistory) =>
      (currentHistory || []).filter((item) => item.id !== id)
    )
  }

  const allResults = useMemo<SearchResult[]>(() => {
    const results: SearchResult[] = []
    const navigationResults = (navigationData as NavigationMeta[]).map((item) => {
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

    results.push(...navigationResults)

    files.forEach((file) => {
      results.push({
        id: `file-${file.id}`,
        title: file.name,
        subtitle: file.path,
        category: 'Files',
        icon: <File size={18} weight="duotone" />,
        action: () => {
          onNavigate('code')
          onFileSelect(file.id)
        },
        tags: [file.language, file.path, 'code', 'file'],
      })
    })

    models.forEach((model) => {
      results.push({
        id: `model-${model.id}`,
        title: model.name,
        subtitle: `${model.fields.length} fields`,
        category: 'Models',
        icon: <Database size={18} weight="duotone" />,
        action: () => onNavigate('models', model.id),
        tags: ['prisma', 'database', 'schema', model.name.toLowerCase()],
      })
    })

    components.forEach((component) => {
      results.push({
        id: `component-${component.id}`,
        title: component.name,
        subtitle: component.type,
        category: 'Components',
        icon: <Tree size={18} weight="duotone" />,
        action: () => onNavigate('components', component.id),
        tags: ['react', 'component', component.type.toLowerCase(), component.name.toLowerCase()],
      })
    })

    componentTrees.forEach((tree) => {
      results.push({
        id: `tree-${tree.id}`,
        title: tree.name,
        subtitle: tree.description || `${tree.rootNodes.length} root nodes`,
        category: 'Component Trees',
        icon: <Folder size={18} weight="duotone" />,
        action: () => onNavigate('component-trees', tree.id),
        tags: ['hierarchy', 'structure', tree.name.toLowerCase()],
      })
    })

    workflows.forEach((workflow) => {
      results.push({
        id: `workflow-${workflow.id}`,
        title: workflow.name,
        subtitle: workflow.description || `${workflow.nodes.length} nodes`,
        category: 'Workflows',
        icon: <FlowArrow size={18} weight="duotone" />,
        action: () => onNavigate('workflows', workflow.id),
        tags: ['automation', 'flow', workflow.name.toLowerCase()],
      })
    })

    lambdas.forEach((lambda) => {
      results.push({
        id: `lambda-${lambda.id}`,
        title: lambda.name,
        subtitle: lambda.description || lambda.runtime,
        category: 'Lambdas',
        icon: <Code size={18} weight="duotone" />,
        action: () => onNavigate('lambdas', lambda.id),
        tags: ['serverless', 'function', lambda.runtime, lambda.name.toLowerCase()],
      })
    })

    playwrightTests.forEach((test) => {
      results.push({
        id: `playwright-${test.id}`,
        title: test.name,
        subtitle: test.description,
        category: 'Playwright Tests',
        icon: <Play size={18} weight="duotone" />,
        action: () => onNavigate('playwright', test.id),
        tags: ['testing', 'e2e', test.name.toLowerCase()],
      })
    })

    storybookStories.forEach((story) => {
      results.push({
        id: `storybook-${story.id}`,
        title: story.storyName,
        subtitle: story.componentName,
        category: 'Storybook Stories',
        icon: <BookOpen size={18} weight="duotone" />,
        action: () => onNavigate('storybook', story.id),
        tags: ['documentation', 'story', story.componentName.toLowerCase()],
      })
    })

    unitTests.forEach((test) => {
      results.push({
        id: `unit-test-${test.id}`,
        title: test.name,
        subtitle: test.description,
        category: 'Unit Tests',
        icon: <Cube size={18} weight="duotone" />,
        action: () => onNavigate('unit-tests', test.id),
        tags: ['testing', 'unit', test.name.toLowerCase()],
      })
    })

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

  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return []
    }

    const query = searchQuery.toLowerCase().trim()
    const queryWords = query.split(/\s+/)

    return allResults
      .map((result) => {
        let score = 0
        const titleLower = result.title.toLowerCase()
        const subtitleLower = result.subtitle?.toLowerCase() || ''
        const categoryLower = result.category.toLowerCase()
        const tagsLower = result.tags?.map((tag) => tag.toLowerCase()) || []

        if (titleLower === query) score += 100
        else if (titleLower.startsWith(query)) score += 50
        else if (titleLower.includes(query)) score += 30

        if (subtitleLower.includes(query)) score += 20
        if (categoryLower.includes(query)) score += 15

        tagsLower.forEach((tag) => {
          if (tag === query) score += 40
          else if (tag.includes(query)) score += 10
        })

        queryWords.forEach((word) => {
          if (titleLower.includes(word)) score += 5
          if (subtitleLower.includes(word)) score += 3
          if (tagsLower.some((tag) => tag.includes(word))) score += 2
        })

        return { result, score }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 50)
      .map(({ result }) => result)
  }, [allResults, searchQuery])

  const recentSearches = useMemo(() => {
    const safeHistory = searchHistory || []
    return safeHistory.slice(0, 10).map((item) => {
      const result = allResults.find((searchResult) => searchResult.id === item.resultId)
      return {
        historyItem: item,
        result,
      }
    })
  }, [searchHistory, allResults])

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    filteredResults.forEach((result) => {
      if (!groups[result.category]) {
        groups[result.category] = []
      }
      groups[result.category].push(result)
    })
    return groups
  }, [filteredResults])

  const handleSelect = (result: SearchResult) => {
    addToHistory(searchQuery, result)
    result.action()
    onOpenChange(false)
  }

  const handleHistorySelect = (historyItem: SearchHistoryItem, result?: SearchResult) => {
    if (result) {
      result.action()
      onOpenChange(false)
    } else {
      setSearchQuery(historyItem.query)
    }
  }

  return {
    searchQuery,
    setSearchQuery,
    recentSearches,
    groupedResults,
    clearHistory,
    removeHistoryItem,
    handleSelect,
    handleHistorySelect,
  }
}
