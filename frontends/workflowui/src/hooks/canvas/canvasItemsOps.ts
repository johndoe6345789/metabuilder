/** canvasItemsOps - Create/update/bulk operations for canvas items */

import type { Dispatch } from 'redux';
import {
  setProjectLoading, setProjectError, addCanvasItem,
  updateCanvasItem, bulkUpdateCanvasItems,
  type ProjectCanvasItem,
} from '@metabuilder/redux-slices';
import {
  projectService,
  type CreateCanvasItemRequest,
  type UpdateCanvasItemRequest,
} from '@metabuilder/services';
import { projectCanvasItemDB } from '../../db/schema';

type ShowFn = (msg: string) => void;

export async function createItem(
  projectId: string,
  data: CreateCanvasItemRequest,
  dispatch: Dispatch,
  showError: ShowFn,
  showSuccess: ShowFn
): Promise<ProjectCanvasItem | null> {
  dispatch(setProjectLoading(true));
  try {
    const item = await projectService.createCanvasItem(
      projectId, data
    );
    dispatch(addCanvasItem(item));
    await projectCanvasItemDB.create(item);
    showSuccess('Workflow added to canvas');
    return item;
  } catch (err) {
    const msg = err instanceof Error
      ? err.message : 'Failed to add workflow to canvas';
    dispatch(setProjectError(msg));
    showError(msg);
    throw err;
  } finally {
    dispatch(setProjectLoading(false));
  }
}

export async function updateItem(
  projectId: string,
  itemId: string,
  data: UpdateCanvasItemRequest,
  dispatch: Dispatch,
  showError: ShowFn
): Promise<ProjectCanvasItem | null> {
  try {
    const updated = await projectService.updateCanvasItem(
      projectId, itemId, data
    );
    dispatch(updateCanvasItem({ ...updated, id: itemId }));
    await projectCanvasItemDB.update(updated);
    return updated;
  } catch (err) {
    const msg = err instanceof Error
      ? err.message : 'Failed to update canvas item';
    dispatch(setProjectError(msg));
    showError(msg);
    throw err;
  }
}

export async function bulkUpdate(
  projectId: string,
  updates: Array<Partial<ProjectCanvasItem> & { id: string }>,
  dispatch: Dispatch,
  showError: ShowFn
): Promise<void> {
  try {
    const response =
      await projectService.bulkUpdateCanvasItems(
        projectId, { items: updates }
      );
    dispatch(bulkUpdateCanvasItems(response.items));
    await Promise.all(
      response.items.map((item) =>
        projectCanvasItemDB.update(item)
      )
    );
  } catch (err) {
    const msg = err instanceof Error
      ? err.message : 'Failed to update canvas items';
    dispatch(setProjectError(msg));
    showError(msg);
    throw err;
  }
}
