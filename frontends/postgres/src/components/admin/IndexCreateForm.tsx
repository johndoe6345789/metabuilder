'use client';

import {
  Button, Checkbox, Chip, FormControl,
  FormControlLabel, InputLabel, MenuItem,
  Select, TextField, Typography,
} from '@metabuilder/components/m3';
import type { IndexType } from '@/utils/featureConfig';
import s from './index-create-form.module.scss';

export type IndexCreateFormProps = {
  indexName: string;
  onIndexNameChange: (v: string) => void;
  selectedColumns: string[];
  onColumnsChange: (v: string[]) => void;
  indexType: string;
  onIndexTypeChange: (v: string) => void;
  isUnique: boolean;
  onUniqueChange: (v: boolean) => void;
  availableColumns: string[];
  indexTypes: IndexType[];
  loading: boolean;
  onCreate: () => void;
  onCancel: () => void;
};

function renderChips(selected: unknown) {
  return (
    <div className={s.chips}>
      {(selected as string[]).map(v => (
        <Chip key={v} label={v} size="small" />
      ))}
    </div>
  );
}

export default function IndexCreateForm(p: IndexCreateFormProps) {
  return (
    <>
      <TextField
        fullWidth label="Index Name" value={p.indexName}
        onChange={e => p.onIndexNameChange(e.target.value)}
        className={s.field} placeholder="e.g., idx_users_email"
      />
      <FormControl fullWidth className={s.field}>
        <InputLabel>Columns</InputLabel>
        <Select
          multiple value={p.selectedColumns} label="Columns"
          onChange={e => p.onColumnsChange(e.target.value as string[])}
          renderValue={renderChips}
        >
          {p.availableColumns.map(col => (
            <MenuItem key={col} value={col}>{col}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth className={s.field}>
        <InputLabel>Index Type</InputLabel>
        <Select
          value={p.indexType} label="Index Type"
          onChange={e => p.onIndexTypeChange(e.target.value)}
        >
          {p.indexTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              <div>
                <Typography variant="body1">{type.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {type.description}
                </Typography>
              </div>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControlLabel
        control={(
          <Checkbox
            checked={p.isUnique}
            onChange={e => p.onUniqueChange(e.target.checked)}
          />
        )}
        label="Unique Index"
        className={s.field}
      />
      <div className={s.actions}>
        <Button variant="contained" onClick={p.onCreate} disabled={p.loading}>
          Create
        </Button>
        <Button variant="outlined" onClick={p.onCancel}>
          Cancel
        </Button>
      </div>
    </>
  );
}
