/**
 * useUIModals Hook
 * Manages modal open/close/toggle state
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  openModal,
  closeModal,
  toggleModal
} from '@metabuilder/redux-slices/uiSlice';

export interface UseUIModalsReturn {
  modals: Record<string, boolean>;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  toggleModal: (modalName: string) => void;
}

export function useUIModals(): UseUIModalsReturn {
  const dispatch = useDispatch();
  const modals = useSelector((state: RootState) => state.ui.modals);

  const open = useCallback(
    (modalName: string) => {
      dispatch(openModal(modalName as any));
    },
    [dispatch]
  );

  const close = useCallback(
    (modalName: string) => {
      dispatch(closeModal(modalName as any));
    },
    [dispatch]
  );

  const toggle = useCallback(
    (modalName: string) => {
      dispatch(toggleModal(modalName as any));
    },
    [dispatch]
  );

  return {
    modals,
    openModal: open,
    closeModal: close,
    toggleModal: toggle
  };
}

export default useUIModals;
