/**
 * canvasItemOps - Async operations for canvas item CRUD
 */

import type { Dispatch } from 'redux';
import {
  setCanvasItems,
  removeCanvasItem,
  setProjectLoading,
  setProjectError,
} from '@metabuilder/redux-slices';
import { projectService } from '@metabuilder/services';
import { projectCanvasItemDB } from '../../db/schema';

type ShowFn = (msg: string) => void;

export async function loadCanvasItems(
  projectId: string,
  dispatch: Dispatch,
  showError: ShowFn
): Promise<void> {
  dispatch(setProjectLoading(true));
  try {
    const response =
      await projectService.getCanvasItems(projectId);
    dispatch(setCanvasItems(response.items));
    await Promise.all(
      response.items.map((item) =>
        projectCanvasItemDB.update(item)
      )
    );
    dispatch(setProjectError(null));
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Failed to load canvas items';
    dispatch(setProjectError(msg));
    showError(msg);
  } finally {
    dispatch(setProjectLoading(false));
  }
}

export async function deleteCanvasItem(
  projectId: string,
  itemId: string,
  dispatch: Dispatch,
  showError: ShowFn,
  showSuccess: ShowFn
): Promise<void> {
  dispatch(setProjectLoading(true));
  try {
    await projectService.deleteCanvasItem(projectId, itemId);
    dispatch(removeCanvasItem(itemId));
    await projectCanvasItemDB.delete(itemId);
    showSuccess('Workflow removed from canvas');
  } catch (err) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Failed to remove from canvas';
    dispatch(setProjectError(msg));
    showError(msg);
    throw err;
  } finally {
    dispatch(setProjectLoading(false));
  }
}
