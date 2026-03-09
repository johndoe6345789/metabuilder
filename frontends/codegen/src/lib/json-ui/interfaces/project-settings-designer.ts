import { NextJsConfig, NpmSettings } from '@/types/project'

export interface ProjectSettingsDesignerProps {
  nextjsConfig: NextJsConfig
  npmSettings: NpmSettings
  onNextjsConfigChange: (config: NextJsConfig | ((current: NextJsConfig) => NextJsConfig)) => void
  onNpmSettingsChange: (settings: NpmSettings | ((current: NpmSettings) => NpmSettings)) => void
}
