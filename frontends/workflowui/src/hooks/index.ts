/**
 * WorkflowUI Hooks Index
 *
 * This module exports hooks in priority order:
 * 1. Local app-specific hooks (override shared versions)
 * 2. Re-exports from @metabuilder/hooks (shared utilities)
 *
 * NOTE: Named exports AFTER `export *` will override those from the barrel export.
 */

// Re-export all shared hooks from @metabuilder/hooks
export * from '@metabuilder/hooks';

// Local editor hook - overrides @metabuilder/hooks useEditor to use Redux directly
// This provides a simpler interface that doesn't require options parameter
export { useEditor } from './useEditor';
export type { UseEditorReturn } from './useEditor';

// Local canvas keyboard hook - uses Redux directly (no dependency injection)
export { useCanvasKeyboard } from './useCanvasKeyboard';

// i18n
export { useTranslation } from './useTranslation';
export { I18nProvider, useI18n } from './I18nContext';
export type { UseTranslationReturn, UseTranslationOptions } from './useTranslation';
export type { I18nContextValue, I18nProviderProps } from './I18nContext';
