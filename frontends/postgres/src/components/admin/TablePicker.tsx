'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from '@metabuilder/components/m3';

type Option = {
  table_name: string;
};

type Props = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function TablePicker({
  label,
  value,
  options,
  onChange,
}: Props) {
  return (
    <FormControl fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={e => onChange(String(e.target.value))}
        displayEmpty
        renderValue={selected =>
          (selected as string)
            ? selected
            : <em>Select a table</em>
        }
      >
        <MenuItem value="">
          <em>Select a table</em>
        </MenuItem>
        {options.map(option => (
          <MenuItem key={option.table_name} value={option.table_name}>
            {option.table_name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
