import moleculesData from './molecules.json'
import organismsData from './organisms.json'
import { ComponentTree } from '@/types/project'

export const moleculeComponentTrees: ComponentTree[] = moleculesData.molecules
export const organismComponentTrees: ComponentTree[] = organismsData.organisms

export const allComponentTrees: ComponentTree[] = [
  ...moleculeComponentTrees,
  ...organismComponentTrees,
]

export function getComponentTreesByCategory(category: 'molecule' | 'organism'): ComponentTree[] {
  if (category === 'molecule') {
    return moleculeComponentTrees
  }
  return organismComponentTrees
}

export function getComponentTreeById(id: string): ComponentTree | undefined {
  return allComponentTrees.find(tree => tree.id === id)
}

export function getComponentTreeByName(name: string): ComponentTree | undefined {
  return allComponentTrees.find(tree => tree.name === name)
}

export default {
  molecules: moleculeComponentTrees,
  organisms: organismComponentTrees,
  all: allComponentTrees,
  getByCategory: getComponentTreesByCategory,
  getById: getComponentTreeById,
  getByName: getComponentTreeByName,
}
