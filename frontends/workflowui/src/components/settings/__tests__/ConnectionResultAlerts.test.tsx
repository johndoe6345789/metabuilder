/**
 * Tests for ConnectionResultAlerts component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import ConnectionResultAlerts from '../ConnectionResultAlerts';

describe('ConnectionResultAlerts', () => {
  it('renders nothing when both results are null', () => {
    const { container } = render(
      <ConnectionResultAlerts testResult={null} switchResult={null} />
    );
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);
  });

  it('renders test result success alert', () => {
    render(
      <ConnectionResultAlerts
        testResult={{ ok: true, message: 'Connected successfully' }}
        switchResult={null}
      />
    );
    const alert = screen.getByTestId('test-result');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent('Connected successfully');
    expect(alert).toHaveAttribute('data-severity', 'success');
  });

  it('renders test result error alert', () => {
    render(
      <ConnectionResultAlerts
        testResult={{ ok: false, message: 'Connection failed' }}
        switchResult={null}
      />
    );
    const alert = screen.getByTestId('test-result');
    expect(alert).toHaveAttribute('data-severity', 'error');
    expect(alert).toHaveTextContent('Connection failed');
  });

  it('renders switch result success alert', () => {
    render(
      <ConnectionResultAlerts
        testResult={null}
        switchResult={{ ok: true, message: 'Switched to postgres' }}
      />
    );
    const alert = screen.getByTestId('switch-result');
    expect(alert).toHaveAttribute('data-severity', 'success');
    expect(alert).toHaveTextContent('Switched to postgres');
  });

  it('renders switch result error alert', () => {
    render(
      <ConnectionResultAlerts
        testResult={null}
        switchResult={{ ok: false, message: 'Switch failed' }}
      />
    );
    const alert = screen.getByTestId('switch-result');
    expect(alert).toHaveAttribute('data-severity', 'error');
  });

  it('renders both alerts when both results provided', () => {
    render(
      <ConnectionResultAlerts
        testResult={{ ok: true, message: 'Test OK' }}
        switchResult={{ ok: false, message: 'Switch Failed' }}
      />
    );
    expect(screen.getByTestId('test-result')).toBeInTheDocument();
    expect(screen.getByTestId('switch-result')).toBeInTheDocument();
  });
});
