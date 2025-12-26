import { getModel } from '../../utils/get-model'
import { getPrimaryKeyField } from '../../utils/get-primary-key-field'

export async function readEntity(entity: string, id: string): Promise<unknown | null> {
  const model = getModel(entity)
  const primaryKeyField = getPrimaryKeyField(entity)
  return model.findUnique({ where: { [primaryKeyField]: id } })
}
