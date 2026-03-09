import { useState } from 'react'
import { NpmPackage, NpmSettings } from '@/types/project'

interface UseProjectSettingsActionsProps {
  onNpmSettingsChange: (settings: NpmSettings | ((current: NpmSettings) => NpmSettings)) => void
}

export function useProjectSettingsActions({
  onNpmSettingsChange,
}: UseProjectSettingsActionsProps) {
  const [packageDialogOpen, setPackageDialogOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<NpmPackage | null>(null)
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false)
  const [scriptKey, setScriptKey] = useState('')
  const [scriptValue, setScriptValue] = useState('')
  const [editingScriptKey, setEditingScriptKey] = useState<string | null>(null)

  const handleAddPackage = () => {
    setEditingPackage({
      id: `package-${Date.now()}`,
      name: '',
      version: 'latest',
      isDev: false,
    })
    setPackageDialogOpen(true)
  }

  const handleEditPackage = (pkg: NpmPackage) => {
    setEditingPackage({ ...pkg })
    setPackageDialogOpen(true)
  }

  const handleSavePackage = () => {
    if (!editingPackage || !editingPackage.name) return

    onNpmSettingsChange((current) => {
      const existingIndex = current.packages.findIndex((p) => p.id === editingPackage.id)
      if (existingIndex >= 0) {
        const updated = [...current.packages]
        updated[existingIndex] = editingPackage
        return { ...current, packages: updated }
      }
      return { ...current, packages: [...current.packages, editingPackage] }
    })

    setPackageDialogOpen(false)
    setEditingPackage(null)
  }

  const handleDeletePackage = (packageId: string) => {
    onNpmSettingsChange((current) => ({
      ...current,
      packages: current.packages.filter((p) => p.id !== packageId),
    }))
  }

  const handleAddScript = () => {
    setScriptKey('')
    setScriptValue('')
    setEditingScriptKey(null)
    setScriptDialogOpen(true)
  }

  const handleEditScript = (key: string, value: string) => {
    setScriptKey(key)
    setScriptValue(value)
    setEditingScriptKey(key)
    setScriptDialogOpen(true)
  }

  const handleSaveScript = () => {
    if (!scriptKey || !scriptValue) return

    onNpmSettingsChange((current) => {
      const scripts = { ...current.scripts }
      if (editingScriptKey && editingScriptKey !== scriptKey) {
        delete scripts[editingScriptKey]
      }
      scripts[scriptKey] = scriptValue
      return { ...current, scripts }
    })

    setScriptDialogOpen(false)
    setScriptKey('')
    setScriptValue('')
    setEditingScriptKey(null)
  }

  const handleDeleteScript = (key: string) => {
    onNpmSettingsChange((current) => {
      const scripts = { ...current.scripts }
      delete scripts[key]
      return { ...current, scripts }
    })
  }

  return {
    packageDialogOpen,
    setPackageDialogOpen,
    editingPackage,
    setEditingPackage,
    scriptDialogOpen,
    setScriptDialogOpen,
    scriptKey,
    setScriptKey,
    scriptValue,
    setScriptValue,
    editingScriptKey,
    setEditingScriptKey,
    handleAddPackage,
    handleEditPackage,
    handleSavePackage,
    handleDeletePackage,
    handleAddScript,
    handleEditScript,
    handleSaveScript,
    handleDeleteScript,
  }
}
