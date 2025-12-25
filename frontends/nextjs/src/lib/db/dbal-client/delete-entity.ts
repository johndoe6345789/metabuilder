import { getModel } from './get-model'

export async function deleteEntity(entity: string, id: string): Promise<boolean> {
  const model = getModel(entity)
  try {
    await model.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}
