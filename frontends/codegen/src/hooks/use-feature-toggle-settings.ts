import type { FeatureToggles } from '@/types/project'

const featureLabels: Record<string, string> = {
  codeEditor: 'Code Editor',
  models: 'Data Models',
  components: 'Components',
  componentTrees: 'Component Trees',
  workflows: 'Workflows',
  lambdas: 'Lambda Functions',
  styling: 'Styling',
  flaskApi: 'Flask API',
  playwright: 'Playwright Tests',
  storybook: 'Storybook',
  unitTests: 'Unit Tests',
  errorRepair: 'Error Repair',
  documentation: 'Documentation',
  sassStyles: 'Sass Styles',
  faviconDesigner: 'Favicon Designer',
  ideaCloud: 'Idea Cloud',
  schemaEditor: 'Schema Editor',
  dataBinding: 'Data Binding',
}

const featureDescriptions: Record<string, string> = {
  codeEditor: 'Monaco-based code editor with syntax highlighting and IntelliSense',
  models: 'Data model designer',
  components: 'Visual component builder and JSON definition editor',
  componentTrees: 'Hierarchical component tree manager and inspector',
  workflows: 'DAG workflow editor for multi-step automations',
  lambdas: 'Serverless function builder and deployment manager',
  styling: 'SCSS and design token editor',
  flaskApi: 'Python Flask API scaffold and endpoint manager',
  playwright: 'E2E test recorder and runner',
  storybook: 'Component story builder and visual test suite',
  unitTests: 'Vitest unit test editor and runner',
  errorRepair: 'AI-assisted error detection and repair suggestions',
  documentation: 'In-app documentation viewer',
  sassStyles: 'Sass stylesheet manager and variable editor',
  faviconDesigner: 'SVG favicon creator and exporter',
  ideaCloud: 'Feature idea brainstorming board',
  schemaEditor: 'JSON Schema visual editor',
  dataBinding: 'Data binding designer and expression editor',
}

export function useFeatureToggleSettings(
  features: FeatureToggles | undefined,
  onFeaturesChange: ((features: FeatureToggles) => void) | undefined,
) {
  const safeFeatures = features ?? {} as FeatureToggles

  const items = Object.entries(safeFeatures).map(([key, enabled]) => ({
    key,
    enabled: Boolean(enabled),
    label: featureLabels[key] ?? key,
    description: featureDescriptions[key] ?? '',
    onToggle: () => onFeaturesChange?.({
      ...safeFeatures,
      [key]: !safeFeatures[key as keyof FeatureToggles],
    }),
  }))

  const enabledCount = items.filter(i => i.enabled).length
  const totalCount = items.length

  return { items, enabledCount, totalCount }
}
