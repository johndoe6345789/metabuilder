'use client';

import {
  Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControl, FormControlLabel, InputLabel,
  MenuItem, Select, TextField,
} from '@metabuilder/components/fakemui';
import s from './add-column-dialog.module.scss';
import { useAddColumnForm } from './hooks/useAddColumnForm';

type DataType = { name: string };

type Props = {
  open: boolean;
  tableName: string;
  dataTypes: DataType[];
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
};

export default function AddColumnDialog({
  open, tableName, dataTypes, onClose, onSubmit,
}: Props) {
  const {
    name, setName, type, setType,
    nullable, setNullable, defaultVal, setDefaultVal,
    busy, isValid, handleClose, handleSubmit,
  } = useAddColumnForm(onSubmit, onClose);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Column — {tableName}</DialogTitle>
      <DialogContent className={s.content}>
        <TextField label="Column Name" value={name} fullWidth autoFocus
          size="small" onChange={e => setName(e.target.value)} />
        <FormControl fullWidth size="small">
          <InputLabel>Data Type</InputLabel>
          <Select value={type} label="Data Type"
            onChange={e => setType(e.target.value as string)}>
            {dataTypes.map(dt => (
              <MenuItem key={dt.name} value={dt.name}>{dt.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField label="Default Value" value={defaultVal} fullWidth
          size="small" placeholder="Optional"
          onChange={e => setDefaultVal(e.target.value)} />
        <FormControlLabel label="Nullable" control={
          <Checkbox size="small" checked={nullable}
            onChange={e => setNullable(e.target.checked)} />
        } />
      </DialogContent>
      <DialogActions className={s.actions}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}
          disabled={busy || !isValid}>
          Add Column
        </Button>
      </DialogActions>
    </Dialog>
  );
}
