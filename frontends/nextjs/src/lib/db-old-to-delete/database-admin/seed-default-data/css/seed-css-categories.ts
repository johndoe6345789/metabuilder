import { getCssClasses, setCssClasses } from '../../../css-classes'
import { buildDefaultCssCategories } from './default-css-categories'

export const seedCssCategories = async () => {
  const cssClasses = await getCssClasses()

  if (cssClasses.length === 0) {
    await setCssClasses(buildDefaultCssCategories())
  }
}
