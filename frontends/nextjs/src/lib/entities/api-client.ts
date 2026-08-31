/**
 * API client utilities for entity CRUD operations
 *
 * Provides functions to interact with entity APIs.
 */

export type { ApiResponse } from './api-client/request'
export type { ListQueryParams } from './api-client/query-string'
export { fetchEntityList } from './api-client/fetch-entity-list'
export { fetchEntity } from './api-client/fetch-entity'
export { createEntity } from './api-client/create-entity'
export { updateEntity } from './api-client/update-entity'
export { deleteEntity } from './api-client/delete-entity'
