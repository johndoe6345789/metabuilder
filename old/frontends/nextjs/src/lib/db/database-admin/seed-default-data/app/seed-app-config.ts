import { getAppConfig, setAppConfig } from '../../../app-config'
import { buildDefaultAppConfig } from './default-app-config'

export const seedAppConfig = async () => {
  const appConfig = await getAppConfig()

  if (appConfig === null) {
    await setAppConfig(buildDefaultAppConfig())
  }
}
