import { NextJsConfig } from '@/types/project'

export type NextJsConfigSectionProps = {
  nextjsConfig: NextJsConfig
  onNextjsConfigChange: (config: NextJsConfig | ((current: NextJsConfig) => NextJsConfig)) => void
}
