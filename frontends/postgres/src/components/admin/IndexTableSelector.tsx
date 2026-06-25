'use client';

import AddIcon from '@metabuilder/components/m3/Add';
import { Button, Paper } from '@metabuilder/components/m3';
import s from './index-table-selector.module.scss';
import TablePicker from './TablePicker';

type IndexTableSelectorProps = {
  tables: Array<{ table_name: string }>;
  selectedTable: string;
  loading: boolean;
  onTableChange: (tableName: string) => void;
  onCreateClick: () => void;
};

export default function IndexTableSelector({
  tables,
  selectedTable,
  loading,
  onTableChange,
  onCreateClick,
}: IndexTableSelectorProps) {
  return (
    <Paper className={s.paper}>
      <TablePicker
        label="Select Table"
        value={selectedTable}
        onChange={onTableChange}
        options={tables}
      />
      {selectedTable && (
        <div className={s.createBtn}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            disabled={loading}
          >
            Create Index
          </Button>
        </div>
      )}
    </Paper>
  );
}
