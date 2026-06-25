/**
 * useSearchLocalResults
 *
 * Extracted from use-search-input.ts — handles
 * client-side filtering of nav items and Redux
 * entities. No DBAL calls here.
 */

import { useMemo } from 'react'
import { useAppSelector } from '@/store'
import type { SearchCategory } from './use-search-input'
import navigationData from '@/data/global-search.json'

interface NavigationMeta {
  id: string
  title: string
  subtitle: string
  category: string
  icon: string
  tab: string
  tags: string[]
}

const NAV_ITEMS = navigationData as NavigationMeta[]

const EMPTY: readonly Record<string, unknown>[] = []

function searchEntities(
  items: Array<Record<string, unknown>>,
  label: string,
  page: string,
  q: string
): Array<{
  id: string
  title: string
  subtitle: string
  page: string
}> {
  return items
    .filter((item) =>
      String(item.name ?? item.title ?? '')
        .toLowerCase()
        .includes(q)
    )
    .slice(0, 5)
    .map((item) => ({
      id: `${label.toLowerCase()}-${item.id}`,
      title: String(
        item.name ?? item.title ?? 'Untitled'
      ),
      subtitle: String(
        item.path ??
          item.description ??
          item.type ??
          label
      ),
      page,
    }))
}

interface Args {
  query: string
  t?: (key: string, fallback?: string) => string
}

export function useSearchLocalResults({
  query,
  t,
}: Args): SearchCategory[] {
  const files = useAppSelector(
    (s) => s.files?.files ?? EMPTY
  )
  const models = useAppSelector(
    (s) => s.models?.models ?? EMPTY
  )
  const components = useAppSelector(
    (s) => s.components?.components ?? EMPTY
  )
  const workflows = useAppSelector(
    (s) => s.workflows?.workflows ?? EMPTY
  )
  const lambdas = useAppSelector(
    (s) => s.lambdas?.lambdas ?? EMPTY
  )

  return useMemo<SearchCategory[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []

    const cats: SearchCategory[] = []

    const navResults = NAV_ITEMS.filter((item) => {
      const matchTitle = item.title
        .toLowerCase()
        .includes(q)
      const matchSub = item.subtitle
        .toLowerCase()
        .includes(q)
      const matchTags = item.tags.some((tag) =>
        tag.toLowerCase().includes(q)
      )
      const translated = t
        ? t(`navigation.${item.tab}`, item.title)
        : ''
      const matchTrans = translated
        ? translated.toLowerCase().includes(q)
        : false
      return (
        matchTitle || matchSub || matchTags || matchTrans
      )
    }).slice(0, 5)

    if (navResults.length > 0) {
      cats.push({
        label: 'Navigation',
        results: navResults.map((item) => ({
          id: item.id,
          title: t
            ? t(`navigation.${item.tab}`, item.title)
            : item.title,
          subtitle: item.subtitle,
          page: item.tab,
        })),
      })
    }

    const add = (
      items: readonly Record<string, unknown>[],
      label: string,
      page: string
    ) => {
      const r = searchEntities(
        items as Record<string, unknown>[],
        label,
        page,
        q
      )
      if (r.length > 0) cats.push({ label, results: r })
    }

    add(files, 'Files', 'code')
    add(models, 'Models', 'models')
    add(components, 'Components', 'components')
    add(workflows, 'Workflows', 'workflows')
    add(lambdas, 'Lambdas', 'lambdas')

    return cats
  }, [query, files, models, components, workflows, lambdas, t])
}
