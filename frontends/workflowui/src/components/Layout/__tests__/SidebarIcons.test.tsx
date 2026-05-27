/**
 * Tests for SidebarIcons - all exported SVG icon components
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  HomeIcon, WorkflowIcon, RecentIcon, StarIcon,
  TemplatesIcon, PluginsIcon, SettingsIcon,
  NotificationsIcon, HelpIcon, DocsIcon,
} from '../SidebarIcons';

const icons = [
  ['HomeIcon', HomeIcon],
  ['WorkflowIcon', WorkflowIcon],
  ['RecentIcon', RecentIcon],
  ['StarIcon', StarIcon],
  ['TemplatesIcon', TemplatesIcon],
  ['PluginsIcon', PluginsIcon],
  ['SettingsIcon', SettingsIcon],
  ['NotificationsIcon', NotificationsIcon],
  ['HelpIcon', HelpIcon],
  ['DocsIcon', DocsIcon],
] as const;

describe.each(icons)('%s', (name, Icon) => {
  it('renders an svg element', () => {
    const { container } = render(<Icon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('has width and height of 20', () => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });
});
