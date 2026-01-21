import { JSONPageRenderer } from '@/components/JSONPageRenderer'
import dashboardSchema from '@/config/pages/dashboard.json'
import { ProjectFile, PrismaModel, ComponentNode, ThemeConfig, PlaywrightTest, StorybookStory, UnitTest, FlaskConfig, NextJsConfig } from '@/types/project'

interface ProjectDashboardProps {
  files: ProjectFile[]
  models: PrismaModel[]
  components: ComponentNode[]
  theme: ThemeConfig
  playwrightTests: PlaywrightTest[]
  storybookStories: StorybookStory[]
  unitTests: UnitTest[]
  flaskConfig: FlaskConfig
  nextjsConfig: NextJsConfig
}

function calculateCompletionScore(data: any) {
  const { files = [], models = [], components = [], playwrightTests = [], storybookStories = [], unitTests = [] } = data
  
  const totalFiles = files.length
  const totalModels = models.length
  const totalComponents = components.length
  const totalTests = playwrightTests.length + storybookStories.length + unitTests.length

  let score = 0
  if (totalFiles > 0) score += 30
  if (totalModels > 0) score += 20
  if (totalComponents > 0) score += 20
  if (totalTests > 0) score += 30

  const completionScore = Math.min(score, 100)
  
  return {
    completionScore,
    completionStatus: completionScore >= 70 ? 'ready' : 'inProgress',
    completionMessage: getCompletionMessage(completionScore)
  }
}

function getCompletionMessage(score: number): string {
  if (score >= 90) return 'Excellent! Your project is production-ready.'
  if (score >= 70) return 'Great progress! Consider adding more tests.'
  if (score >= 50) return 'Good start! Keep building features.'
  return 'Just getting started. Add some components and models.'
}

export function ProjectDashboard(props: ProjectDashboardProps) {
  const completionMetrics = calculateCompletionScore(props)

  return (
    <JSONPageRenderer
      schema={dashboardSchema as any}
      data={{ ...props, ...completionMetrics }}
    />
  )
}
