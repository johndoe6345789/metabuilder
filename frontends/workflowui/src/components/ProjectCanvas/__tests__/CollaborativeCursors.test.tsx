/**
 * Tests for CollaborativeCursors component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { CollaborativeCursors, RemoteCursorData } from '../CollaborativeCursors';

const makeCursor = (overrides: Partial<RemoteCursorData> = {}): RemoteCursorData => ({
  userId: 'user-1',
  userName: 'Alice',
  userColor: '#ff0000',
  position: { x: 100, y: 100 },
  ...overrides,
});

describe('CollaborativeCursors', () => {
  const defaultProps = {
    zoom: 1,
    pan: { x: 0, y: 0 },
  };

  it('renders nothing when cursors array is empty', () => {
    const { container } = render(
      <CollaborativeCursors cursors={[]} {...defaultProps} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders a cursor element for each visible cursor', () => {
    const cursors = [
      makeCursor({ userId: 'u1', userName: 'Alice' }),
      makeCursor({ userId: 'u2', userName: 'Bob', position: { x: 200, y: 200 } }),
    ];
    render(<CollaborativeCursors cursors={cursors} {...defaultProps} />);
    expect(screen.getByTitle('Alice')).toBeInTheDocument();
    expect(screen.getByTitle('Bob')).toBeInTheDocument();
  });

  it('does not render cursors far off-screen', () => {
    const cursor = makeCursor({ position: { x: -5000, y: -5000 } });
    render(<CollaborativeCursors cursors={[cursor]} {...defaultProps} />);
    expect(screen.queryByTitle('Alice')).not.toBeInTheDocument();
  });

  it('applies zoom and pan to cursor position', () => {
    const cursor = makeCursor({ position: { x: 50, y: 50 } });
    const { container } = render(
      <CollaborativeCursors cursors={[cursor]} zoom={2} pan={{ x: 10, y: 20 }} />
    );
    // screenX = 50*2 + 10 = 110, screenY = 50*2 + 20 = 120
    const el = container.querySelector('[title="Alice"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.style.left).toBe('110px');
    expect(el.style.top).toBe('120px');
  });

  it('sets CSS custom property for cursor color', () => {
    const cursor = makeCursor({ userColor: '#abcdef' });
    const { container } = render(
      <CollaborativeCursors cursors={[cursor]} {...defaultProps} />
    );
    const el = container.querySelector('[title="Alice"]') as HTMLElement;
    expect(el).not.toBeNull();
    // CSS custom property
    expect(el.style.getPropertyValue('--cursor-color')).toBe('#abcdef');
  });

  it('renders cursor label with user name', () => {
    const cursor = makeCursor({ userName: 'Charlie' });
    render(<CollaborativeCursors cursors={[cursor]} {...defaultProps} />);
    expect(screen.getByTitle('Charlie')).toBeInTheDocument();
  });
});
