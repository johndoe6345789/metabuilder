/**
 * useWorkflowPersistence Hook
 * Manages workflow save/load operations with auto-save and dirty tracking
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Workflow } from '../../types/workflow-editor';

export interface UseWorkflowPersistenceReturn {
  // State
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  lastSaved: number | null;
  saveError: string | null;
  loadError: string | null;

  // Operations
  save: () => Promise<void>;
  load: (workflowId: string) => Promise<void>;
  markDirty: () => void;
  markClean: () => void;

  // Auto-save control
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  isAutoSaveEnabled: boolean;
}

export interface UseWorkflowPersistenceOptions {
  workflow: Workflow;
  onSave?: (workflow: Workflow) => Promise<void>;
  onLoad?: (workflowId: string) => Promise<Workflow>;
  autoSaveDelay?: number;
  autoSaveEnabled?: boolean;
}

export function useWorkflowPersistence(
  options: UseWorkflowPersistenceOptions
): UseWorkflowPersistenceReturn {
  const {
    workflow,
    onSave,
    onLoad,
    autoSaveDelay = 30000,
    autoSaveEnabled: initialAutoSave = false,
  } = options;

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(initialAutoSave);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const workflowRef = useRef(workflow);

  // Keep workflow ref updated
  useEffect(() => {
    workflowRef.current = workflow;
  }, [workflow]);

  // Save operation
  const save = useCallback(async () => {
    if (!onSave) {
      console.warn('No save handler provided');
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(workflowRef.current);
      setLastSaved(Date.now());
      setIsDirty(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save workflow';
      setSaveError(message);
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  // Load operation
  const load = useCallback(
    async (workflowId: string) => {
      if (!onLoad) {
        console.warn('No load handler provided');
        return;
      }

      setIsLoading(true);
      setLoadError(null);

      try {
        await onLoad(workflowId);
        setIsDirty(false);
        setLastSaved(Date.now());
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load workflow';
        setLoadError(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onLoad]
  );

  // Dirty tracking
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const markClean = useCallback(() => {
    setIsDirty(false);
  }, []);

  // Auto-save control
  const enableAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(true);
  }, []);

  const disableAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(false);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (isAutoSaveEnabled && isDirty && !isSaving) {
      autoSaveTimerRef.current = setTimeout(() => {
        save().catch((err) => {
          console.error('Auto-save failed:', err);
        });
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isAutoSaveEnabled, isDirty, isSaving, autoSaveDelay, save]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return {
    isDirty,
    isSaving,
    isLoading,
    lastSaved,
    saveError,
    loadError,
    save,
    load,
    markDirty,
    markClean,
    enableAutoSave,
    disableAutoSave,
    isAutoSaveEnabled,
  };
}
