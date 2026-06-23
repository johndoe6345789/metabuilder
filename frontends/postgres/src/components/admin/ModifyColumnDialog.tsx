'use client';

import {
  Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormControlLabel, InputLabel,
  MenuItem, Select,
} from '@metabuilder/components/fakemui';
import { useModifyColumnForm } from './hooks/useModifyColumnForm';

type Column = { column_name: string };
type DataType = { name: string };

type Props = {
  open: boolean;
  tableName: string;
  columns: Column[];
  dataTypes: DataType[];
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
};

export default function ModifyColumnDialog({
  open, tableName, columns, dataTypes, onClose, onSubmit,
}: Props) {
  const {
    selected, setSelected, type, setType,
    nullable, setNullable,
    busy, isValid, handleClose, handleSubmit,
  } = useModifyColumnForm(onSubmit, onClose);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Modify Column — {tableName}</DialogTitle>
      <DialogContent sx={{
        display: 'flex', flexDirection: 'column',
        gap: 2, pt: '16px !important',
      }}>
        <FormControl fullWidth size="small">
          <InputLabel>Column</InputLabel>
          <Select value={selected} label="Column"
            onChange={e => setSelected(e.target.value as string)}>
            {columns.map(col => (
              <MenuItem key={col.column_name} value={col.column_name}>
                {col.column_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selected && (
          <>
            <FormControl fullWidth size="small">
              <InputLabel>New Type</InputLabel>
              <Select value={type} label="New Type"
                onChange={e => setType(e.target.value as string)}>
                {dataTypes.map(dt => (
                  <MenuItem key={dt.name} value={dt.name}>{dt.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel label="Nullable" control={
              <Checkbox size="small" checked={nullable}
                onChange={e => setNullable(e.target.checked)} />
            } />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={busy || !isValid}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
