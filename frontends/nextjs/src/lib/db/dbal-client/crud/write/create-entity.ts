import { getModel } from '../../utils/get-model'

export async function createEntity(entity: string, data: Record<string, unknown>): Promise<unknown> {
  const model = getModel(entity)
  return model.create({ data })
}
