'use client';

import {
  TextField, Button, Stack,
  Upload, Refresh,
} from '@shared/m3';
import labels from '@/constants/ui-labels.json';

/** @brief Props for ObjectToolbar molecule. */
export interface ObjectToolbarProps {
  prefix: string;
  onPrefixChange: (p: string) => void;
  onUploadClick: () => void;
  onRefresh: () => void;
}

/**
 * @brief Toolbar with prefix filter and actions.
 * @param props - ObjectToolbar properties.
 */
export default function ObjectToolbar({
  prefix,
  onPrefixChange,
  onUploadClick,
  onRefresh,
}: ObjectToolbarProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      style={{
        marginBottom: 16,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        placeholder={
          labels.objects.filterPrefix
        }
        value={prefix}
        onChange={(e) =>
          onPrefixChange(e.target.value)}
        aria-label={labels.objects.filterPrefix}
        data-testid="prefix-filter"
      />
      <Button
        variant="contained"
        startIcon={<Upload />}
        onClick={onUploadClick}
        aria-label={labels.objects.upload}
      >
        {labels.objects.upload}
      </Button>
      <Button
        variant="outlined"
        startIcon={<Refresh />}
        onClick={onRefresh}
        aria-label={labels.objects.refresh}
      >
        {labels.objects.refresh}
      </Button>
    </Stack>
  );
}
