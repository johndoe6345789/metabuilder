const itemSlices = [
  'files',
  'models',
  'components',
  'componentTrees',
  'workflows',
  'lambdas',
] as const

const itemChangeActionNames = ['addItem', 'updateItem', 'removeItem'] as const

export const itemChangeActionTypes = new Set(
  itemSlices.flatMap((slice) =>
    itemChangeActionNames.map((actionName) => `${slice}/${actionName}`)
  )
)

export const persistenceSingleItemActionNames = new Set([
  'addItem',
  'updateItem',
  'saveFile',
  'saveModel',
  'saveComponent',
  'saveComponentTree',
  'saveWorkflow',
  'saveLambda',
])

export const persistenceBulkActionNames = new Set([
  'addItems',
  'setItems',
  'setFiles',
  'setModels',
  'setComponents',
  'setComponentTrees',
  'setWorkflows',
  'setLambdas',
])

export const persistenceDeleteActionNames = new Set([
  'removeItem',
  'deleteFile',
  'deleteModel',
  'deleteComponent',
  'deleteComponentTree',
  'deleteWorkflow',
  'deleteLambda',
])
