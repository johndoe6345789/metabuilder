'use client';

import {
  getComponentTree, getDataTypes, getFeatureById,
} from '@/utils/featureConfig';
import ComponentTreeRenderer from '@/utils/componentTreeRenderer';
import {
  List, ListItemButton, ListItemIcon, ListItemText,
  Paper, TextField, Typography,
} from '@metabuilder/components/m3';
import InputAdornment
  from '@metabuilder/components/m3/inputs/InputAdornment';
import { useTranslations } from 'next-intl';
import SearchIcon from '@metabuilder/components/m3/Search';
import TableChartIcon from '@metabuilder/components/m3/TableChart';
import s from './table-manager-tab.module.scss';
import CreateTableDialog from './CreateTableDialog';
import DropTableDialog from './DropTableDialog';
import { useTableManager } from './hooks/useTableManager';

type TableManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onCreateTable: (tableName: string, columns: any[]) => Promise<void>;
  onDropTable: (tableName: string) => Promise<void>;
  onTableClick?: (tableName: string) => void;
};

export default function TableManagerTab({
  tables, onCreateTable, onDropTable, onTableClick,
}: TableManagerTabProps) {
  const t = useTranslations('Admin');
  const feature = getFeatureById('table-management');
  const dataTypes = getDataTypes().map(dt => dt.name);
  const canCreate = feature?.ui.actions.includes('create');
  const canDelete = feature?.ui.actions.includes('delete');
  const tree = getComponentTree('TableManagerTab');
  const {
    openCreateDialog, setOpenCreateDialog,
    openDropDialog, setOpenDropDialog,
    searchQuery, setSearchQuery, handlers,
  } = useTableManager();

  const filteredTables = tables.filter(t =>
    t.table_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const data = { feature, tables: filteredTables, canCreate, canDelete };

  return (
    <>
      {tree
        ? <ComponentTreeRenderer tree={tree} data={data} handlers={handlers} />
        : <div>Error: Component tree not found</div>}
      <Paper className={s.paper}>
        <div className={s.inner}>
          <Typography variant="h6" gutterBottom>
            {t('view.tableManager.existing')} ({filteredTables.length}
            {searchQuery ? ` of ${tables.length}` : ''})
          </Typography>
          <TextField size="small" fullWidth
            placeholder={t('view.tableManager.filter')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={s.search}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <List dense disablePadding>
            {filteredTables.length === 0 && (
              <Typography variant="body2" color="text.secondary"
                className={s.tableHint}>
                {searchQuery
                  ? t('view.tableManager.noMatch')
                  : t('view.tableManager.none')}
              </Typography>
            )}
            {filteredTables.map(table => (
              <ListItemButton key={table.table_name} className={s.tableRow}
                onClick={() => onTableClick?.(table.table_name)}
                disabled={!onTableClick}>
                <ListItemIcon className={s.tableIcon}>
                  <TableChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <span className={s.itemText}>{table.table_name}</span>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </div>
      </Paper>
      <CreateTableDialog open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={onCreateTable} dataTypes={dataTypes} />
      <DropTableDialog open={openDropDialog} tables={tables}
        onClose={() => setOpenDropDialog(false)} onDrop={onDropTable} />
    </>
  );
}
