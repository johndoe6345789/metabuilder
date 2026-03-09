import { Project } from '@/types/project'

export function useProjectLoader(
  setFiles: (updater: any) => void,
  setModels: (updater: any) => void,
  setComponents: (updater: any) => void,
  setComponentTrees: (updater: any) => void,
  setWorkflows: (updater: any) => void,
  setLambdas: (updater: any) => void,
  setTheme: (updater: any) => void,
  setPlaywrightTests: (updater: any) => void,
  setStorybookStories: (updater: any) => void,
  setUnitTests: (updater: any) => void,
  setFlaskConfig: (updater: any) => void,
  setNextjsConfig: (updater: any) => void,
  setNpmSettings: (updater: any) => void,
  setFeatureToggles: (updater: any) => void
) {
  const loadProject = (project: Project) => {
    if (project.files) setFiles(project.files)
    if (project.models) setModels(project.models)
    if (project.components) setComponents(project.components)
    if (project.componentTrees) setComponentTrees(project.componentTrees)
    if (project.workflows) setWorkflows(project.workflows)
    if (project.lambdas) setLambdas(project.lambdas)
    if (project.theme) setTheme(project.theme)
    if (project.playwrightTests) setPlaywrightTests(project.playwrightTests)
    if (project.storybookStories) setStorybookStories(project.storybookStories)
    if (project.unitTests) setUnitTests(project.unitTests)
    if (project.flaskConfig) setFlaskConfig(project.flaskConfig)
    if (project.nextjsConfig) setNextjsConfig(project.nextjsConfig)
    if (project.npmSettings) setNpmSettings(project.npmSettings)
    if (project.featureToggles) setFeatureToggles(project.featureToggles)
  }

  return { loadProject }
}
