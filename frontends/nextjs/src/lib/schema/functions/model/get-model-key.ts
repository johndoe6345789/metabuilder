/**
 * Generate a unique key for a model in an app
 * @param appName - The application name
 * @param modelName - The model name
 * @returns A unique key combining app and model names
 */
export const getModelKey = (appName: string, modelName: string): string => {
  return `${appName}_${modelName}`
}
