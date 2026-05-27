/**
 * Tests for ViewToolbar component
 */

const mockUseEditor = jest.fn();

jest.mock('../../../../hooks', () => ({
  useEditor: () => mockUseEditor(),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToolbar } from '../ViewToolbar';

describe('ViewToolbar', () => {
  const makeEditor = (zoom = 1) => ({
    zoom,
    zoomIn: jest.fn(),
    zoomOut: jest.fn(),
    resetZoom: jest.fn(),
  });

  beforeEach(() => {
    mockUseEditor.mockReturnValue(makeEditor());
  });

  it('renders zoom out button', () => {
    render(<ViewToolbar />);
    expect(screen.getByTitle(/zoom out/i)).toBeInTheDocument();
  });

  it('renders zoom in button', () => {
    render(<ViewToolbar />);
    expect(screen.getByTitle(/zoom in/i)).toBeInTheDocument();
  });

  it('renders reset zoom button', () => {
    render(<ViewToolbar />);
    expect(screen.getByTitle(/reset zoom/i)).toBeInTheDocument();
  });

  it('displays zoom percentage', () => {
    mockUseEditor.mockReturnValue(makeEditor(1.5));
    render(<ViewToolbar />);
    expect(screen.getByText('150%')).toBeInTheDocument();
  });

  it('calls zoomOut when zoom out button clicked', () => {
    const editor = makeEditor();
    mockUseEditor.mockReturnValue(editor);
    render(<ViewToolbar />);
    fireEvent.click(screen.getByTitle(/zoom out/i));
    expect(editor.zoomOut).toHaveBeenCalled();
  });

  it('calls zoomIn when zoom in button clicked', () => {
    const editor = makeEditor();
    mockUseEditor.mockReturnValue(editor);
    render(<ViewToolbar />);
    fireEvent.click(screen.getByTitle(/zoom in/i));
    expect(editor.zoomIn).toHaveBeenCalled();
  });

  it('calls resetZoom when reset button clicked', () => {
    const editor = makeEditor();
    mockUseEditor.mockReturnValue(editor);
    render(<ViewToolbar />);
    fireEvent.click(screen.getByTitle(/reset zoom/i));
    expect(editor.resetZoom).toHaveBeenCalled();
  });

  it('calls onMenuOpen when more options button clicked', () => {
    const onMenuOpen = jest.fn();
    render(<ViewToolbar onMenuOpen={onMenuOpen} />);
    fireEvent.click(screen.getByTitle(/more options/i));
    expect(onMenuOpen).toHaveBeenCalled();
  });
});
