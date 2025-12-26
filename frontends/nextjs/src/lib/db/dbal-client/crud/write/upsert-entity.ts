import { getModel } from '../../utils/get-model'

export async function upsertEntity(
  entity: string,
  options: { where: Record<string, unknown>; update: Record<string, unknown>; create: Record<string, unknown> }
): Promise<unknown> {
  const model = getModel(entity)
  return model.upsert({
    where: options.where,
    update: options.update,
    create: options.create,
  })
}
