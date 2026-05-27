/**
 * Tests for InfiniteCanvas sub-components:
 * CanvasContent, CanvasGrid, ZoomControls, NavigationArrows, PanHint
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CanvasContent } from '../CanvasContent';
import { CanvasGrid } from '../CanvasGrid';
import { ZoomControls } from '../ZoomControls';
import { NavigationArrows } from '../NavigationArrows';
import { PanHint } from '../PanHint';

// ---------------------------------------------------------------------------
// CanvasContent
// ---------------------------------------------------------------------------
describe('CanvasContent', () => {
  it('renders children', () => {
    render(
      <CanvasContent zoom={1} panX={0} panY={0}>
        <span>child content</span>
      </CanvasContent>
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('applies transform style based on zoom and pan', () => {
    const { container } = render(
      <CanvasContent zoom={2} panX={50} panY={30}>
        <div />
      </CanvasContent>
    );
    const content = container.firstChild as HTMLElement;
    expect(content.style.transform).toBe('translate(50px, 30px) scale(2)');
  });

  it('applies transformOrigin of "0 0"', () => {
    const { container } = render(
      <CanvasContent zoom={1} panX={0} panY={0}>
        <div />
      </CanvasContent>
    );
    const content = container.firstChild as HTMLElement;
    expect(content.style.transformOrigin).toBe('0 0');
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <CanvasContent ref={ref} zoom={1} panX={0} panY={0}>
        <div />
      </CanvasContent>
    );
    expect(ref.current).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CanvasGrid
// ---------------------------------------------------------------------------
describe('CanvasGrid', () => {
  it('renders an svg with correct snap size', () => {
    const { container } = render(
      <CanvasGrid snapSize={20} gridOffset={{ x: 5, y: 10 }} />
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('applies grid offset transform to svg', () => {
    const { container } = render(
      <CanvasGrid snapSize={10} gridOffset={{ x: 3, y: 7 }} />
    );
    const svg = container.querySelector('svg') as SVGElement;
    expect(svg.style.transform).toBe('translate(3px, 7px)');
  });

  it('renders a circle at center of snap size', () => {
    const { container } = render(
      <CanvasGrid snapSize={20} gridOffset={{ x: 0, y: 0 }} />
    );
    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle).toHaveAttribute('cx', '10');
    expect(circle).toHaveAttribute('cy', '10');
  });
});

// ---------------------------------------------------------------------------
// ZoomControls
// ---------------------------------------------------------------------------
describe('ZoomControls', () => {
  const defaultProps = {
    zoom: 1,
    onZoomIn: jest.fn(),
    onZoomOut: jest.fn(),
    onResetView: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it('renders zoom percentage', () => {
    render(<ZoomControls {...defaultProps} zoom={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('calls onZoomIn', () => {
    const onZoomIn = jest.fn();
    render(<ZoomControls {...defaultProps} onZoomIn={onZoomIn} />);
    fireEvent.click(screen.getByRole('button', { name: /zoom in/i }));
    expect(onZoomIn).toHaveBeenCalled();
  });

  it('calls onZoomOut', () => {
    const onZoomOut = jest.fn();
    render(<ZoomControls {...defaultProps} onZoomOut={onZoomOut} />);
    fireEvent.click(screen.getByRole('button', { name: /zoom out/i }));
    expect(onZoomOut).toHaveBeenCalled();
  });

  it('calls onResetView', () => {
    const onResetView = jest.fn();
    render(<ZoomControls {...defaultProps} onResetView={onResetView} />);
    fireEvent.click(screen.getByRole('button', { name: /reset view/i }));
    expect(onResetView).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// NavigationArrows
// ---------------------------------------------------------------------------
describe('NavigationArrows', () => {
  it('renders four direction buttons', () => {
    const onPan = jest.fn();
    render(<NavigationArrows onPan={onPan} />);
    expect(screen.getByRole('button', { name: /pan up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pan down/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pan left/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pan right/i })).toBeInTheDocument();
  });

  it.each([
    ['up', /pan up/i],
    ['down', /pan down/i],
    ['left', /pan left/i],
    ['right', /pan right/i],
  ] as const)('calls onPan("%s") when button clicked', (direction, label) => {
    const onPan = jest.fn();
    render(<NavigationArrows onPan={onPan} />);
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(onPan).toHaveBeenCalledWith(direction);
  });
});

// ---------------------------------------------------------------------------
// PanHint
// ---------------------------------------------------------------------------
describe('PanHint', () => {
  it('renders the pan hint text', () => {
    render(<PanHint />);
    expect(screen.getByText(/shift/i)).toBeInTheDocument();
  });

  it('renders keyboard shortcut key element', () => {
    const { container } = render(<PanHint />);
    expect(container.querySelector('kbd')).not.toBeNull();
  });
});
