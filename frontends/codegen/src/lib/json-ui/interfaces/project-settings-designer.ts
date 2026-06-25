import { NextJsConfig, NpmSettings } from '@/types/project'

export interface ProjectSettingsDesignerProps {
  nextjsConfig: NextJsConfig
  npmSettings: NpmSettings
  onNextjsConfigChange: (
    config: NextJsConfig | ((c: NextJsConfig) => NextJsConfig),
  ) => void
  onNpmSettingsChange: (
    settings: NpmSettings | ((s: NpmSettings) => NpmSettings),
  ) => void
}
