import { NextJsApplicationCard } from '@/components/project-settings/NextJsApplicationCard'
import { NextJsFeaturesCard } from '@/components/project-settings/NextJsFeaturesCard'
import { NextJsConfigSectionProps } from '@/components/project-settings/types'

export function NextJsConfigTab({
  nextjsConfig,
  onNextjsConfigChange,
}: NextJsConfigSectionProps) {
  return (
    <div className="max-w-2xl space-y-6">
      <NextJsApplicationCard
        nextjsConfig={nextjsConfig}
        onNextjsConfigChange={onNextjsConfigChange}
      />
      <NextJsFeaturesCard
        nextjsConfig={nextjsConfig}
        onNextjsConfigChange={onNextjsConfigChange}
      />
    </div>
  )
}
