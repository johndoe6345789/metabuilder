import { getModel } from '../../utils/get-model'
import { getPrimaryKeyField } from '../../utils/get-primary-key-field'

export async function deleteEntity(entity: string, id: string): Promise<boolean> {
  const model = getModel(entity)
  const primaryKeyField = getPrimaryKeyField(entity)
  try {
    await model.delete({ where: { [primaryKeyField]: id } })
    return true
  } catch {
    return false
  }
}
