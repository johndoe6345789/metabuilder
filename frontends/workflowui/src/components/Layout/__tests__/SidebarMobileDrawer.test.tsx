/**
 * Tests for SidebarMobileDrawer component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SidebarMobileDrawer from '../SidebarMobileDrawer';

describe('SidebarMobileDrawer', () => {
  it('renders children', () => {
    render(
      <SidebarMobileDrawer isOpen={true} onClose={jest.fn()}>
        <span>Sidebar content</span>
      </SidebarMobileDrawer>
    );
    expect(screen.getByText('Sidebar content')).toBeInTheDocument();
  });

  it('renders backdrop when open', () => {
    const { container } = render(
      <SidebarMobileDrawer isOpen={true} onClose={jest.fn()}>
        <span />
      </SidebarMobileDrawer>
    );
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('does not render backdrop div when closed', () => {
    const { container } = render(
      <SidebarMobileDrawer isOpen={false} onClose={jest.fn()}>
        <span />
      </SidebarMobileDrawer>
    );
    // Backdrop div has onClick (aside does not) - when closed no onClick backdrop
    const clickableHiddenEls = Array.from(container.querySelectorAll('[aria-hidden="true"]'));
    // The aside itself is hidden but has no onClick; the backdrop div (onClick) should not exist
    const backdropDivs = clickableHiddenEls.filter((el) => el.tagName === 'DIV');
    expect(backdropDivs).toHaveLength(0);
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <SidebarMobileDrawer isOpen={true} onClose={onClose}>
        <span />
      </SidebarMobileDrawer>
    );
    const backdrop = container.querySelector('[aria-hidden="true"]') as Element;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders aside with sidebar data-testid', () => {
    render(
      <SidebarMobileDrawer isOpen={true} onClose={jest.fn()}>
        <span />
      </SidebarMobileDrawer>
    );
    expect(screen.getByTestId('nav-sidebar')).toBeInTheDocument();
  });

  it('aside has aria-hidden=false when open', () => {
    render(
      <SidebarMobileDrawer isOpen={true} onClose={jest.fn()}>
        <span />
      </SidebarMobileDrawer>
    );
    const aside = screen.getByTestId('nav-sidebar');
    expect(aside).toHaveAttribute('aria-hidden', 'false');
  });

  it('aside has aria-hidden=true when closed', () => {
    render(
      <SidebarMobileDrawer isOpen={false} onClose={jest.fn()}>
        <span />
      </SidebarMobileDrawer>
    );
    const aside = screen.getByTestId('nav-sidebar');
    expect(aside).toHaveAttribute('aria-hidden', 'true');
  });
});
