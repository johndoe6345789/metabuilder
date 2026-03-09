import { useState } from 'react'
import { useProjectSettingsActions } from '@/components/project-settings/useProjectSettingsActions'
import copy from '@/data/project-settings.json'
import { NextJsConfig, NpmSettings } from '@/types/project'

interface UseProjectSettingsViewArgs {
  nextjsConfig: NextJsConfig
  npmSettings: NpmSettings
  onNextjsConfigChange: (config: NextJsConfig | ((current: NextJsConfig) => NextJsConfig)) => void
  onNpmSettingsChange: (settings: NpmSettings | ((current: NpmSettings) => NpmSettings)) => void
}

export function useProjectSettingsView(args: UseProjectSettingsViewArgs) {
  const [selectedTab, setSelectedTab] = useState(0)
  const actions = useProjectSettingsActions({ onNpmSettingsChange: args.onNpmSettingsChange })

  return {
    ...args,
    ...actions,
    copy,
    selectedTab,
    selectTab0: () => setSelectedTab(0),
    selectTab1: () => setSelectedTab(1),
    selectTab2: () => setSelectedTab(2),
    selectTab3: () => setSelectedTab(3),
    selectTab4: () => setSelectedTab(4),
    tab0Selected: selectedTab === 0,
    tab1Selected: selectedTab === 1,
    tab2Selected: selectedTab === 2,
    tab3Selected: selectedTab === 3,
    tab4Selected: selectedTab === 4,
    showTab0: selectedTab === 0,
    showTab1: selectedTab === 1,
    showTab2: selectedTab === 2,
    showTab3: selectedTab === 3,
    showTab4: selectedTab === 4,
  }
}
