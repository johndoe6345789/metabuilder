'use client'

import { useCallback, useState } from 'react'

/** View state for the CSS class manager (no state in the component). */
export function useCssUi() {
  const [newName, setNewName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [propKey, setPropKey] = useState('')
  const [propVal, setPropVal] = useState('')

  const resetNewProp = useCallback(() => {
    setPropKey('')
    setPropVal('')
  }, [])

  return {
    newName,
    setNewName,
    selectedId,
    setSelectedId,
    propKey,
    setPropKey,
    propVal,
    setPropVal,
    resetNewProp,
  }
}
