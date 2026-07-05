'use client'

import { useCallback, useState } from 'react'

/** View state for the Config tab (no state in the component). */
export function useConfigUi() {
  const [newListName, setNewListName] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [optLabel, setOptLabel] = useState('')
  const [optValue, setOptValue] = useState('')

  const resetOpt = useCallback(() => { setOptLabel(''); setOptValue('') }, [])

  return {
    newListName, setNewListName, selectedId, setSelectedId,
    optLabel, setOptLabel, optValue, setOptValue, resetOpt,
  }
}
