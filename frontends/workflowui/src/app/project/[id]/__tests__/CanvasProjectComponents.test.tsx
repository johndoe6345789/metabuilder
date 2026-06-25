/**
 * Tests for project canvas page components:
 * CanvasLoadingState, WorkflowCardMeta, WorkflowCardActions, CanvasViewport
 */

// WorkflowCardActions uses Pencil and Star icons from m3 which aren't in mock
jest.mock('@metabuilder/m3', () => ({
  ...jest.requireActual('@metabuilder/m3'),
  Pencil: () => <span data-icon="pencil" />,
  Star: () => <span data-icon="star" />,
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CanvasLoadingState from '../CanvasLoadingState';
import WorkflowCardMeta from '../WorkflowCardMeta';
import WorkflowCardActions from '../WorkflowCardActions';
import CanvasViewport from '../CanvasViewport';

// ---------------------------------------------------------------------------
// CanvasLoadingState
// ---------------------------------------------------------------------------
describe('CanvasLoadingState', () => {
  it('renders loading spinner', () => {
    render(<CanvasLoadingState />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders loading text', () => {
    render(<CanvasLoadingState />);
    expect(screen.getByText(/loading project canvas/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// WorkflowCardMeta
// ---------------------------------------------------------------------------
describe('WorkflowCardMeta', () => {
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();

  it('renders node count', () => {
    render(
      <WorkflowCardMeta nodeCount={5} lastModified={0} formatDate={formatDate} />
    );
    expect(screen.getByText('5 nodes')).toBeInTheDocument();
  });

  it('renders modified date via formatDate', () => {
    const formatDate = jest.fn().mockReturnValue('Jan 1, 2025');
    render(
      <WorkflowCardMeta nodeCount={3} lastModified={1234567} formatDate={formatDate} />
    );
    expect(screen.getByText(/Modified Jan 1, 2025/)).toBeInTheDocument();
    expect(formatDate).toHaveBeenCalledWith(1234567);
  });
});

// ---------------------------------------------------------------------------
// WorkflowCardActions
// ---------------------------------------------------------------------------
describe('WorkflowCardActions', () => {
  it('renders edit and favorite buttons', () => {
    render(
      <WorkflowCardActions
        workflowId="wf-1"
        onCardClick={jest.fn()}
        onFavorite={jest.fn()}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('calls onCardClick with workflowId when edit button clicked', () => {
    const onCardClick = jest.fn();
    const { container } = render(
      <WorkflowCardActions
        workflowId="wf-42"
        onCardClick={onCardClick}
        onFavorite={jest.fn()}
      />
    );
    // Open in editor button
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(onCardClick).toHaveBeenCalledWith('wf-42');
  });

  it('calls onFavorite when favorite button clicked', () => {
    const onFavorite = jest.fn();
    render(
      <WorkflowCardActions
        workflowId="wf-1"
        onCardClick={jest.fn()}
        onFavorite={onFavorite}
      />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(onFavorite).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// CanvasViewport
// ---------------------------------------------------------------------------
describe('CanvasViewport', () => {
  it('renders children', () => {
    render(
      <CanvasViewport
        canvasZoom={1}
        canvasPan={{ x: 0, y: 0 }}
        onDragOver={jest.fn()}
        onDrop={jest.fn()}
      >
        <span>canvas child</span>
      </CanvasViewport>
    );
    expect(screen.getByText('canvas child')).toBeInTheDocument();
  });

  it('calls onDragOver handler', () => {
    const onDragOver = jest.fn();
    const { container } = render(
      <CanvasViewport
        canvasZoom={1}
        canvasPan={{ x: 0, y: 0 }}
        onDragOver={onDragOver}
        onDrop={jest.fn()}
      >
        <span />
      </CanvasViewport>
    );
    fireEvent.dragOver(container.firstChild as Element);
    expect(onDragOver).toHaveBeenCalled();
  });

  it('calls onDrop handler', () => {
    const onDrop = jest.fn();
    const { container } = render(
      <CanvasViewport
        canvasZoom={1}
        canvasPan={{ x: 0, y: 0 }}
        onDragOver={jest.fn()}
        onDrop={onDrop}
      >
        <span />
      </CanvasViewport>
    );
    fireEvent.drop(container.firstChild as Element);
    expect(onDrop).toHaveBeenCalled();
  });
});
