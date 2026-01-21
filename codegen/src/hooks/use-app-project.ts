import { useMemo } from 'react'
import { toast } from 'sonner'
import appStrings from '@/data/app-shortcuts.json'
import { useFileOperations } from '@/hooks/use-file-operations'
import { useProjectState } from '@/hooks/use-project-state'
import type { Project } from '@/types/project'
export default function useAppProject() {
  const projectState = useProjectState()
  const {
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    theme,
    playwrightTests,
    storybookStories,
    unitTests,
    flaskConfig,
    nextjsConfig,
    npmSettings,
    featureToggles,
    setFiles,
    setModels,
    setComponents,
    setComponentTrees,
    setWorkflows,
    setLambdas,
    setTheme,
    setPlaywrightTests,
    setStorybookStories,
    setUnitTests,
    setFlaskConfig,
    setNextjsConfig,
    setNpmSettings,
    setFeatureToggles,
  } = projectState

  const fileOps = useFileOperations(files, setFiles)
  const currentProject = useMemo<Project>(
    () => ({
      name: nextjsConfig.appName,
      files,
      models,
      components,
      componentTrees,
      workflows,
      lambdas,
      theme,
      playwrightTests,
      storybookStories,
      unitTests,
      flaskConfig,
      nextjsConfig,
      npmSettings,
      featureToggles,
    }),
    [
      componentTrees,
      components,
      featureToggles,
      files,
      flaskConfig,
      lambdas,
      models,
      nextjsConfig,
      npmSettings,
      playwrightTests,
      storybookStories,
      theme,
      unitTests,
      workflows,
    ]
  )
  const handleProjectLoad = (project: Project) => {
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
    toast.success(appStrings.messages.projectLoaded)
  }
  const stateContext = {
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    theme,
    playwrightTests,
    storybookStories,
    unitTests,
    flaskConfig,
    nextjsConfig,
    npmSettings,
    featureToggles,
    activeFileId: fileOps.activeFileId,
  }
  const actionContext = {
    handleFileChange: fileOps.handleFileChange,
    setActiveFileId: fileOps.setActiveFileId,
    handleFileClose: fileOps.handleFileClose,
    handleFileAdd: fileOps.handleFileAdd,
    setModels,
    setComponents,
    setComponentTrees,
    setWorkflows,
    setLambdas,
    setTheme,
    setPlaywrightTests,
    setStorybookStories,
    setUnitTests,
    setFlaskConfig,
    setNextjsConfig,
    setNpmSettings,
    setFeatureToggles,
  }

  return {
    files,
    models,
    components,
    componentTrees,
    workflows,
    lambdas,
    playwrightTests,
    storybookStories,
    unitTests,
    featureToggles,
    fileOps,
    currentProject,
    handleProjectLoad,
    stateContext,
    actionContext,
  }
}
