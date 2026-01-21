'use client';

import { useState } from 'react';
import { getComponentTree, getDataTypes, getFeatureById } from '@/utils/featureConfig';
import ComponentTreeRenderer from '@/utils/componentTreeRenderer';
import CreateTableDialog from './CreateTableDialog';
import DropTableDialog from './DropTableDialog';

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
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDropDialog, setOpenDropDialog] = useState(false);

  // Get feature configuration from JSON
  const feature = getFeatureById('table-management');
  const dataTypes = getDataTypes().map(dt => dt.name);

  // Check if actions are enabled
  const canCreate = feature?.ui.actions.includes('create');
  const canDelete = feature?.ui.actions.includes('delete');

  // Get component tree from features.json
  const tree = getComponentTree('TableManagerTab');

  // Prepare data for the component tree
  const data = {
    feature,
    tables,
    canCreate,
    canDelete,
  };

  // Define handlers for the component tree
  const handlers = {
    openCreateDialog: () => setOpenCreateDialog(true),
    openDropDialog: () => setOpenDropDialog(true),
  };

  return (
    <>
      {tree ? (
        <ComponentTreeRenderer tree={tree} data={data} handlers={handlers} />
      ) : (
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
