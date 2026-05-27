import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  TextField,
  Typography,
  Select,
  Checkbox,
  IconButton,
  Paper,
  Card,
  Chip,
  Container,
  Stack,
} from './index.tsx';
import {
  Alert,
  LoadingSpinner,
  EmptyState,
  ErrorDisplay,
  SuccessDisplay,
} from './feedback';

describe('atoms/index', () => {
  it('Button renders with children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getAllByText('Click Me').length).toBeGreaterThan(0);
  });

  it('TextField renders an input', () => {
    const { container } = render(<TextField label="Name" />);
    expect(container.querySelector('input')).not.toBeNull();
  });

  it('Typography renders text', () => {
    render(<Typography>Hello</Typography>);
    expect(screen.getAllByText('Hello').length).toBeGreaterThan(0);
  });

  it('Select renders with options', () => {
    const { container } = render(
      <Select
        value=""
        onChange={vi.fn()}
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
      />,
    );
    expect(container.querySelector('[role="combobox"]')).not.toBeNull();
  });

  it('Checkbox renders without label', () => {
    const { container } = render(<Checkbox />);
    expect(container.querySelector('input[type="checkbox"]')).not.toBeNull();
  });

  it('Checkbox renders with label', () => {
    render(<Checkbox label="I agree" />);
    expect(screen.getAllByText('I agree').length).toBeGreaterThan(0);
  });

  it('IconButton renders a button', () => {
    const { container } = render(<IconButton aria-label="test" />);
    expect(container.querySelector('button')).not.toBeNull();
  });

  it('Paper renders children', () => {
    render(<Paper><span>Content</span></Paper>);
    expect(screen.getAllByText('Content').length).toBeGreaterThan(0);
  });

  it('Card renders children', () => {
    render(<Card><span>Card Content</span></Card>);
    expect(screen.getAllByText('Card Content').length).toBeGreaterThan(0);
  });

  it('Chip renders label', () => {
    render(<Chip label="Tag" />);
    expect(screen.getAllByText('Tag').length).toBeGreaterThan(0);
  });

  it('Container renders children', () => {
    render(<Container><span>Inside Container</span></Container>);
    expect(screen.getAllByText('Inside Container').length).toBeGreaterThan(0);
  });

  it('Stack renders children in column direction by default', () => {
    const { container } = render(
      <Stack>
        <span>Child 1</span>
        <span>Child 2</span>
      </Stack>,
    );
    expect(screen.getAllByText('Child 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Child 2').length).toBeGreaterThan(0);
  });

  it('Stack renders children in row direction', () => {
    const { container } = render(
      <Stack direction="row">
        <span>Row Child</span>
      </Stack>,
    );
    expect(screen.getAllByText('Row Child').length).toBeGreaterThan(0);
  });

  it('Alert renders a message', () => {
    render(<Alert severity="info">Alert message</Alert>);
    expect(screen.getAllByText('Alert message').length).toBeGreaterThan(0);
  });

  it('LoadingSpinner renders a progress indicator', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('[role="progressbar"]')).not.toBeNull();
  });

  it('EmptyState renders default message', () => {
    render(<EmptyState />);
    expect(screen.getAllByText('No data available').length).toBeGreaterThan(0);
  });

  it('ErrorDisplay renders null for null error', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('ErrorDisplay renders error message', () => {
    render(<ErrorDisplay error="Something failed" />);
    expect(screen.getAllByText('Something failed').length).toBeGreaterThan(0);
  });

  it('SuccessDisplay renders null for null message', () => {
    const { container } = render(<SuccessDisplay message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('SuccessDisplay renders success message', () => {
    render(<SuccessDisplay message="All good!" />);
    expect(screen.getAllByText('All good!').length).toBeGreaterThan(0);
  });
});
