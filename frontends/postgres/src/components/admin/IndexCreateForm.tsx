'use client';

import {
  Box, Button, Checkbox, Chip, FormControl,
  FormControlLabel, InputLabel, MenuItem,
  Select, TextField, Typography,
} from '@metabuilder/components/fakemui';
import type { IndexType } from '@/utils/featureConfig';

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
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {(selected as string[]).map(v => (
        <Chip key={v} label={v} size="small" />
      ))}
    </Box>
  );
}

export default function IndexCreateForm(p: IndexCreateFormProps) {
  return (
    <>
      <TextField
        fullWidth label="Index Name" value={p.indexName}
        onChange={e => p.onIndexNameChange(e.target.value)}
        sx={{ mt: 2 }} placeholder="e.g., idx_users_email"
      />
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Columns</InputLabel>
        <Select
          multiple value={p.selectedColumns} label="Columns"
          onChange={e =>
            p.onColumnsChange(e.target.value as string[])}
          renderValue={renderChips}
        >
          {p.availableColumns.map(col => (
            <MenuItem key={col} value={col}>{col}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ mt: 2 }}>
        <InputLabel>Index Type</InputLabel>
        <Select
          value={p.indexType} label="Index Type"
          onChange={e => p.onIndexTypeChange(e.target.value)}
        >
          {p.indexTypes.map(type => (
            <MenuItem key={type.value} value={type.value}>
              <Box>
                <Typography variant="body1">
                  {type.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {type.description}
                </Typography>
              </Box>
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
        sx={{ mt: 2 }}
      />
      <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
        <Button
          variant="contained" onClick={p.onCreate}
          disabled={p.loading}
        >
          Create
        </Button>
        <Button variant="outlined" onClick={p.onCancel}>
          Cancel
        </Button>
      </Box>
    </>
  );
}
