'use client';

import {
  getComponentTree,
  getDataTypes,
  getFeatureById,
} from '@/utils/featureConfig';
import ComponentTreeRenderer from '@/utils/componentTreeRenderer';
import CreateTableDialog from './CreateTableDialog';
import DropTableDialog from './DropTableDialog';
import { useTableManager } from './hooks/useTableManager';

type TableManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onCreateTable: (tableName: string, columns: any[]) => Promise<void>;
  onDropTable: (tableName: string) => Promise<void>;
};

export default function TableManagerTab({
  tables,
  onCreateTable,
  onDropTable,
}: TableManagerTabProps) {
  const feature = getFeatureById('table-management');
  const dataTypes = getDataTypes().map(dt => dt.name);
  const canCreate = feature?.ui.actions.includes('create');
  const canDelete = feature?.ui.actions.includes('delete');
  const tree = getComponentTree('TableManagerTab');

  const {
    openCreateDialog,
    setOpenCreateDialog,
    openDropDialog,
    setOpenDropDialog,
    handlers,
  } = useTableManager();

  const data = { feature, tables, canCreate, canDelete };

  return (
    <>
      {tree
        ? (
            <ComponentTreeRenderer
              tree={tree}
              data={data}
              handlers={handlers}
            />
          )
        : (
            <div>Error: Component tree not found</div>
          )}

      <CreateTableDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={onCreateTable}
        dataTypes={dataTypes}
      />

      <DropTableDialog
        open={openDropDialog}
        tables={tables}
        onClose={() => setOpenDropDialog(false)}
        onDrop={onDropTable}
      />
    </>
  );
}
