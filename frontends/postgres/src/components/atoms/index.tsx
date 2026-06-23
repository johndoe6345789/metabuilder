/**
 * Atomic Components Library — thin wrappers with no business logic.
 * Feedback components live in ./feedback (re-exported below).
 */

import type {
  ButtonProps, CardProps, CheckboxProps, ChipProps,
  IconButtonProps, PaperProps, SelectProps, TextFieldProps,
  TypographyProps,
} from '@metabuilder/components/fakemui';
import {
  Box,
  Card as MuiCard,
  Checkbox as MuiCheckbox,
  Chip as MuiChip,
  Button as MuiButton,
  IconButton as MuiIconButton,
  Paper as MuiPaper,
  Select as MuiSelect,
  TextField as MuiTextField,
  Typography as MuiTypography,
  FormControlLabel,
  MenuItem,
} from '@metabuilder/components/fakemui';
import React from 'react';

export function Button(props: ButtonProps) {
  return <MuiButton {...props} />;
}
export function TextField(props: TextFieldProps) {
  return <MuiTextField {...props} />;
}
export function Typography(props: TypographyProps) {
  return <MuiTypography {...props} />;
}
export function Select(
  props: SelectProps & {
    options?: Array<{ value: string; label: string }>;
  },
) {
  const { options = [], ...rest } = props;
  return (
    <MuiSelect {...rest}>
      {options.map(o => (
        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
      ))}
    </MuiSelect>
  );
}
export function Checkbox(props: CheckboxProps & { label?: string }) {
  const { label, ...rest } = props;
  if (label) {
    return (
      <FormControlLabel
        control={<MuiCheckbox {...rest} />}
        label={label}
      />
    );
  }
  return <MuiCheckbox {...rest} />;
}
export function IconButton(props: IconButtonProps) {
  return <MuiIconButton {...props} />;
}
export function Paper(props: PaperProps) {
  return <MuiPaper {...props} />;
}
export function Card(props: CardProps) {
  return <MuiCard {...props} />;
}
export function Chip(props: ChipProps) {
  return <MuiChip {...props} />;
}
export function Container({
  children, ...props
}: React.PropsWithChildren<{ sx?: any }>) {
  return <Box sx={{ p: 3, ...props.sx }}>{children}</Box>;
}
export function Stack({
  children, direction = 'column', spacing = 2, ...props
}: React.PropsWithChildren<{
  direction?: 'row' | 'column'; spacing?: number; sx?: any;
}>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, gap: spacing, ...props.sx }}>
      {children}
    </Box>
  );
}

export {
  Alert, EmptyState, ErrorDisplay, LoadingSpinner, SuccessDisplay,
} from './feedback';
