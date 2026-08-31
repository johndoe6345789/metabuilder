'use client'

import { useDropdownConfigs } from './use-dropdown-configs'
import { useSmtpConfig } from './use-smtp-config'
import { useConfigUi } from './use-config-ui'

/** Everything ConfigTab's view needs: state, derived values, and actions. */
export function useConfigTab() {
  const dd = useDropdownConfigs()
  const smtp = useSmtpConfig()
  const ui = useConfigUi()
  // .at(0) is typed `T | undefined` under both tsconfig variants (unlike
  // `configs[0]`, whose type depends on noUncheckedIndexedAccess), so this
  // stays real narrowing even when dd.configs is empty at runtime.
  const selected =
    dd.configs.find(c => c.id === ui.selectedId) ?? dd.configs.at(0)

  const addList = (): void => {
    if (ui.newListName.trim().length === 0) return
    ui.setSelectedId(dd.create(ui.newListName))
    ui.setNewListName('')
  }

  const addOpt = (): void => {
    if (selected === undefined || ui.optLabel.trim().length === 0) return
    dd.addOption(selected.id, {
      label: ui.optLabel.trim(),
      value:
        ui.optValue.trim().length > 0 ? ui.optValue.trim() : ui.optLabel.trim(),
    })
    ui.resetOpt()
  }

  return { dd, smtp, ui, selected, addList, addOpt }
}
