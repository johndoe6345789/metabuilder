'use client';

import { TextField as MuiTextField, TextFieldProps as MuiTextFieldProps } from '@mui/material';

export type TextFieldProps = MuiTextFieldProps & {
  // Additional props from features.json
};

/**
 * Atomic TextField component
 * Wraps Material-UI TextField with features.json configuration
 */
export default function TextField(props: TextFieldProps) {
  return <MuiTextField {...props} />;
}
