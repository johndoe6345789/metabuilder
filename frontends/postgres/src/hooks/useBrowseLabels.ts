/**
 * Builds the translated label set for the shared TablesTab (Browse view).
 * Kept as a hook so the shared library stays i18n-agnostic — it just receives
 * resolved strings/formatters as props.
 */

'use client';

import { useTranslations } from 'next-intl';
import type { TablesTabLabels } from '@metabuilder/m3';

export function useBrowseLabels(): TablesTabLabels {
  const t = useTranslations('Admin');
  return {
    title: t('browse.title'),
    tablesCount: count => t('browse.tablesCount', { count }),
    browseSchema: t('browse.eyebrow'),
    available: count => t('browse.available', { count }),
    ofTotal: (count, total) => t('browse.ofTotal', { count, total }),
    filter: t('browse.filter'),
    noMatch: t('browse.noMatch'),
    context: t('browse.context'),
    browseTables: t('browse.browseTables'),
    browseHint: t('browse.browseHint'),
    selectedHint: t('browse.selectedHint'),
    drawerHint: t('browse.drawerHint'),
    total: t('browse.total'),
    search: t('browse.search'),
    layout: t('browse.layout'),
    scope: t('browse.scope'),
    match: t('browse.match'),
    selectedTable: t('browse.selectedTable'),
    allVisible: t('browse.allVisible'),
    visible: count => t('browse.visible', { count }),
    twoPane: t('browse.twoPane'),
    filtered: t('browse.filtered'),
    allTables: t('browse.allTables'),
    openTable: t('browse.openTable'),
  };
}
