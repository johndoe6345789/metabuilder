import { useMemo } from 'react'
import { ProjectFile, PrismaModel, ComponentNode, ThemeConfig, PlaywrightTest, StorybookStory, UnitTest, FlaskConfig } from '@/types/project'

interface DashboardMetrics {
  totalFiles: number
  totalModels: number
  totalComponents: number
  totalThemeVariants: number
  totalEndpoints: number
  totalTests: number
  playwrightCount: number
  storybookCount: number
  unitTestCount: number
  blueprintCount: number
  completionScore: number
  completionMessage: string
  isReadyToExport: boolean
}

interface UseDashboardMetricsProps {
  files: ProjectFile[]
  models: PrismaModel[]
  components: ComponentNode[]
  theme: ThemeConfig
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  flaskConfig: FlaskConfig
}

function calculateCompletionScore(metrics: {
  files: number
  models: number
  components: number
  tests: number
}): number {
  let score = 0
  if (metrics.files > 0) score += 25
  if (metrics.models > 0) score += 25
  if (metrics.components > 0) score += 25
  if (metrics.tests > 0) score += 25
  return score
}

function getCompletionMessage(score: number): string {
  if (score >= 90) return 'Excellent! Your project is complete and ready for export.'
  if (score >= 70) return 'Great progress! Add a few more tests to reach 100%.'
  if (score >= 50) return 'Making good progress. Keep adding features and tests.'
  if (score >= 25) return 'Good start! Continue building your application.'
  return 'Just getting started. Create files, models, and components to begin.'
}

export function useDashboardMetrics({
  files,
  models,
  components,
  theme,
  playwrightTests,
  storybookStories,
  unitTests,
  flaskConfig,
}: UseDashboardMetricsProps): DashboardMetrics {
  return useMemo(() => {
    const totalFiles = files.length
    const totalModels = models.length
    const totalComponents = components.length
    const totalThemeVariants = theme?.variants?.length || 0
    const totalEndpoints = flaskConfig.blueprints.reduce((acc, bp) => acc + bp.endpoints.length, 0)
    const totalTests = playwrightTests.length + storybookStories.length + unitTests.length
    
    const completionScore = calculateCompletionScore({
      files: totalFiles,
      models: totalModels,
      components: totalComponents,
      tests: totalTests,
    })

    return {
      totalFiles,
      totalModels,
      totalComponents,
      totalThemeVariants,
      totalEndpoints,
      totalTests,
      playwrightCount: playwrightTests.length,
      storybookCount: storybookStories.length,
      unitTestCount: unitTests.length,
      blueprintCount: flaskConfig.blueprints.length,
      completionScore,
      completionMessage: getCompletionMessage(completionScore),
      isReadyToExport: completionScore >= 70,
    }
  }, [files, models, components, theme, playwrightTests, storybookStories, unitTests, flaskConfig])
}
