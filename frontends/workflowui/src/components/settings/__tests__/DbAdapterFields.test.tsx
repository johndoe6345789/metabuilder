/**
 * Tests for DbAdapterFields component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DbAdapterFields from '../DbAdapterFields';

const defaultProps = {
  fields: ['host', 'port', 'database'],
  formFields: { host: 'localhost', port: '5432', database: 'mydb' },
  selectedAdapter: 'postgres',
  defaultPorts: { postgres: '5432', mysql: '3306' },
  onFieldChange: jest.fn(),
};

describe('DbAdapterFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a field for each field name', () => {
    render(<DbAdapterFields {...defaultProps} />);
    expect(screen.getByTestId('field-host')).toBeInTheDocument();
    expect(screen.getByTestId('field-port')).toBeInTheDocument();
    expect(screen.getByTestId('field-database')).toBeInTheDocument();
  });

  it('shows existing value from formFields', () => {
    render(<DbAdapterFields {...defaultProps} />);
    const hostField = screen.getByTestId('field-host') as HTMLInputElement;
    expect(hostField.value).toBe('localhost');
  });

  it('calls onFieldChange when field value changes', () => {
    const onFieldChange = jest.fn();
    render(<DbAdapterFields {...defaultProps} onFieldChange={onFieldChange} />);
    fireEvent.change(screen.getByTestId('field-host'), { target: { value: '192.168.1.1' } });
    expect(onFieldChange).toHaveBeenCalledWith('host', '192.168.1.1');
  });

  it('uses default port as placeholder for port field', () => {
    render(<DbAdapterFields {...defaultProps} />);
    const portField = screen.getByTestId('field-port') as HTMLInputElement;
    expect(portField.placeholder).toBe('5432');
  });

  it('renders password field as type=password', () => {
    render(
      <DbAdapterFields
        {...defaultProps}
        fields={['password']}
        formFields={{ password: '' }}
      />
    );
    const passwordField = screen.getByTestId('field-password') as HTMLInputElement;
    expect(passwordField.type).toBe('password');
  });

  it('renders non-secret fields as type=text', () => {
    render(<DbAdapterFields {...defaultProps} />);
    const hostField = screen.getByTestId('field-host') as HTMLInputElement;
    expect(hostField.type).toBe('text');
  });

  it('renders empty string for missing formField value', () => {
    render(
      <DbAdapterFields
        {...defaultProps}
        fields={['user']}
        formFields={{}}
      />
    );
    const userField = screen.getByTestId('field-user') as HTMLInputElement;
    expect(userField.value).toBe('');
  });

  it('uses FIELD_PLACEHOLDERS for known fields', () => {
    render(
      <DbAdapterFields
        {...defaultProps}
        fields={['database']}
        formFields={{}}
      />
    );
    const dbField = screen.getByTestId('field-database') as HTMLInputElement;
    expect(dbField.placeholder).toBe('metabuilder');
  });

  it('renders secretKey field as password type (SECRET_FIELDS)', () => {
    render(
      <DbAdapterFields
        {...defaultProps}
        fields={['secretKey']}
        formFields={{}}
      />
    );
    const field = screen.getByTestId('field-secretKey') as HTMLInputElement;
    expect(field.type).toBe('password');
  });
});
