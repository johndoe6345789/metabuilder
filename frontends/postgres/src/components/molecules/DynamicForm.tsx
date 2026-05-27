/**
 * Dynamic Form Renderer
 * Renders forms based on form schemas from features.json
 */

import type { FormField } from '@/utils/featureConfig';
import { Box, Grid } from '@mui/material';
import React from 'react';
import { DynamicFormField } from './DynamicFormField';

type DynamicFormProps = {
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
  onBlur?: (fieldName: string) => void;
  disabled?: boolean;
};

/**
 * Dynamic Form Component
 * Renders a complete form based on schema from features.json
 */
export function DynamicForm({
  fields,
  values,
  errors,
  onChange,
  onBlur,
  disabled,
}: DynamicFormProps) {
  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        const gridSize
          = field.type === 'textarea' || field.type === 'checkbox'
            ? 12
            : 6;
        return (
          <Grid item xs={12} sm={gridSize} key={field.name}>
            <DynamicFormField
              field={field}
              value={values[field.name]}
              error={errors[field.name]}
              onChange={value => onChange(field.name, value)}
              onBlur={
                onBlur ? () => onBlur(field.name) : undefined
              }
              disabled={disabled}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * Form Section - Groups related fields with a title
 */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Box
          component="h3"
          sx={{ m: 0, fontSize: '1.1rem', fontWeight: 500 }}
        >
          {title}
        </Box>
        {description && (
          <Box
            component="p"
            sx={{
              m: 0,
              mt: 0.5,
              fontSize: '0.875rem',
              color: 'text.secondary',
            }}
          >
            {description}
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
}
