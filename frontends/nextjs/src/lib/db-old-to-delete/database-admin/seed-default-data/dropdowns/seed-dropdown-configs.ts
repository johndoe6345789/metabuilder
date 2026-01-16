import { getDropdownConfigs, setDropdownConfigs } from '../../../dropdown-configs'
import { buildDefaultDropdownConfigs } from './default-dropdown-configs'

export const seedDropdownConfigs = async () => {
  const dropdowns = await getDropdownConfigs()

  if (dropdowns.length === 0) {
    await setDropdownConfigs(buildDefaultDropdownConfigs())
  }
}
