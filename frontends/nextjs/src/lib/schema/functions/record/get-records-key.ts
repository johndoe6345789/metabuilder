/**
 * Generate a unique key for records of a model in an app
 * @param appName - The application name
 * @param modelName - The model name
 * @returns A unique key for records storage
 */
export const getRecordsKey = (appName: string, modelName: string): string => {
  return `records_${appName}_${modelName}`
}
