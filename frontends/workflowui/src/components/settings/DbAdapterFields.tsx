/**
 * DbAdapterFields - Dynamic form fields for a DB adapter
 */

'use client';

import React from 'react';
import { TextField } from '@metabuilder/m3';

const FIELD_PLACEHOLDERS: Record<string, string> = {
  host: 'localhost',
  database: 'metabuilder',
  user: 'metabuilder',
  connectionString: 'mongodb://user:pass@host:27017/db',
  path: '/path/to/database.sqlite',
};

const SECRET_FIELDS = new Set([
  'password',
  'secretKey',
  'apiKey',
]);

interface DbAdapterFieldsProps {
  fields: string[];
  formFields: Record<string, string>;
  selectedAdapter: string;
  defaultPorts: Record<string, string>;
  onFieldChange: (field: string, value: string) => void;
}

export default function DbAdapterFields({
  fields,
  formFields,
  selectedAdapter,
  defaultPorts,
  onFieldChange,
}: DbAdapterFieldsProps) {
  const getPlaceholder = (field: string) => {
    if (field === 'port')
      return defaultPorts[selectedAdapter] || '';
    return FIELD_PLACEHOLDERS[field] || '';
  };

  return (
    <>
      {fields.map((field) => (
        <TextField
          key={field}
          label={
            field.charAt(0).toUpperCase() +
            field.slice(1).replace(/([A-Z])/g, ' $1')
          }
          fullWidth
          value={formFields[field] || ''}
          onChange={(e) =>
            onFieldChange(field, e.target.value)
          }
          type={SECRET_FIELDS.has(field) ? 'password' : 'text'}
          placeholder={getPlaceholder(field)}
          data-testid={`field-${field}`}
        />
      ))}
    </>
  );
}
