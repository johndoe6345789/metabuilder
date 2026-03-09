/**
 * useUIModals Hook
 * Manages modal open/close/toggle state
 *
 * Requires: ui slice with modals state (Record<string, boolean>)
 * Actions: openModal, closeModal, toggleModal from uiSlice
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Generic UI state interface
interface UIState {
  modals: Record<string, boolean>;
}

interface RootState {
  ui: UIState;
}

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
      dispatch({ type: 'ui/openModal', payload: modalName });
    },
    [dispatch]
  );

  const close = useCallback(
    (modalName: string) => {
      dispatch({ type: 'ui/closeModal', payload: modalName });
    },
    [dispatch]
  );

  const toggle = useCallback(
    (modalName: string) => {
      dispatch({ type: 'ui/toggleModal', payload: modalName });
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
