import { useState, useEffect, useMemo, useCallback } from 'react'
import { Database, CssCategory } from '@/lib/database'
import { toast } from 'sonner'

const CLASS_TOKEN_PATTERN = /^[A-Za-z0-9:_/.\[\]()%#!,=+-]+$/
const parseClassList = (value: string) => Array.from(new Set(value.split(/\s+/).filter(Boolean)))

interface UseClassBuilderStateProps {
  open: boolean
  initialValue: string
}

export function useClassBuilderState({ open, initialValue }: UseClassBuilderStateProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [categories, setCategories] = useState<CssCategory[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customClass, setCustomClass] = useState('')
  const [activeTab, setActiveTab] = useState('custom')

  const knownClassSet = useMemo(
    () => new Set(categories.flatMap(category => category.classes)),
    [categories]
  )
  const selectedClassSet = useMemo(() => new Set(selectedClasses), [selectedClasses])
  const normalizedSearch = searchQuery.trim().toLowerCase()

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) {
      return categories
    }

    return categories
      .map(category => ({
        ...category,
        classes: category.classes.filter(cls => cls.toLowerCase().includes(normalizedSearch)),
      }))
      .filter(category => category.classes.length > 0)
  }, [categories, normalizedSearch])

  const customTokens = useMemo(() => customClass.trim().split(/\s+/).filter(Boolean), [customClass])
  const uniqueCustomTokens = useMemo(() => Array.from(new Set(customTokens)), [customTokens])
  const invalidCustomTokens = useMemo(
    () => uniqueCustomTokens.filter(token => !CLASS_TOKEN_PATTERN.test(token)),
    [uniqueCustomTokens]
  )
  const duplicateCustomTokens = useMemo(
    () => uniqueCustomTokens.filter(token => selectedClassSet.has(token)),
    [uniqueCustomTokens, selectedClassSet]
  )
  const unknownCustomTokens = useMemo(
    () => uniqueCustomTokens.filter(token => !knownClassSet.has(token)),
    [uniqueCustomTokens, knownClassSet]
  )
  const canAddCustom = useMemo(
    () =>
      uniqueCustomTokens.length > 0 &&
      invalidCustomTokens.length === 0 &&
      uniqueCustomTokens.some(token => !selectedClassSet.has(token)),
    [invalidCustomTokens.length, selectedClassSet, uniqueCustomTokens]
  )

  const loadCssClasses = useCallback(async () => {
    const classes = await Database.getCssClasses()
    const sorted = classes.slice().sort((a, b) => a.name.localeCompare(b.name))
    setCategories(sorted)
  }, [])

  useEffect(() => {
    if (open) {
      loadCssClasses()
      setSelectedClasses(parseClassList(initialValue))
      setSearchQuery('')
      setCustomClass('')
    }
  }, [open, initialValue, loadCssClasses])

  useEffect(() => {
    if (!open) {
      return
    }

    if (filteredCategories.length === 0) {
      setActiveTab('custom')
      return
    }

    if (activeTab === 'custom') {
      return
    }

    const hasActiveTab = filteredCategories.some(category => category.name === activeTab)
    if (!hasActiveTab) {
      setActiveTab(filteredCategories[0]?.name ?? 'custom')
    }
  }, [activeTab, filteredCategories, open])

  const toggleClass = (cssClass: string) => {
    setSelectedClasses(current => {
      if (current.includes(cssClass)) {
        return current.filter(c => c !== cssClass)
      }

      return [...current, cssClass]
    })
  }

  const addCustomClass = () => {
    if (uniqueCustomTokens.length === 0) {
      return
    }

    if (invalidCustomTokens.length > 0) {
      toast.error(`Invalid class name: ${invalidCustomTokens.join(', ')}`)
      return
    }

    const newTokens = uniqueCustomTokens.filter(token => !selectedClassSet.has(token))
    if (newTokens.length === 0) {
      toast.info('Those classes are already selected')
      return
    }

    setSelectedClasses(current => [...current, ...newTokens])
    setCustomClass('')
  }

  const clearSelectedClasses = () => {
    setSelectedClasses([])
  }

  return {
    categories,
    filteredCategories,
    selectedClasses,
    selectedClassSet,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    customClass,
    setCustomClass,
    invalidCustomTokens,
    duplicateCustomTokens,
    unknownCustomTokens,
    canAddCustom,
    addCustomClass,
    toggleClass,
    clearSelectedClasses,
  }
}
