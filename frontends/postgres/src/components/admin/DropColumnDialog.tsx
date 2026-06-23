'use client';

import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Typography,
} from '@metabuilder/components/fakemui';
import { useDropColumnForm } from './hooks/useDropColumnForm';

type Column = { column_name: string };

type Props = {
  open: boolean;
  tableName: string;
  columns: Column[];
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
};

export default function DropColumnDialog({
  open, tableName, columns, onClose, onSubmit,
}: Props) {
  const { selected, setSelected, busy, isValid, handleClose, handleSubmit }
    = useDropColumnForm(onSubmit, onClose);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Drop Column — {tableName}</DialogTitle>
      <DialogContent sx={{
        display: 'flex', flexDirection: 'column',
        gap: 2, pt: '16px !important',
      }}>
        <Typography variant="body2" color="error.main">
          This permanently deletes the column and all its data.
        </Typography>
        <FormControl fullWidth size="small">
          <InputLabel>Column to drop</InputLabel>
          <Select value={selected} label="Column to drop"
            onChange={e => setSelected(e.target.value as string)}>
            {columns.map(col => (
              <MenuItem key={col.column_name} value={col.column_name}>
                {col.column_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleSubmit}
          disabled={busy || !isValid}>
          Drop Column
        </Button>
      </DialogActions>
    </Dialog>
  );
}
