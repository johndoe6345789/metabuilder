/**
 * Auto-Discovered Packages
 *
 * Demonstrates package-prefixed styling from V2 schemas
 */

import type { Meta, StoryObj } from '@storybook/react'

interface PackageClassDemoProps {
  packageId: string
  className: string
}

const meta: Meta = {
  title: 'Auto-Discovered Packages',
  parameters: {
    layout: 'centered',
  },
}

export default meta

/**
 * Package Class Demo - Shows how package prefixes work
 */
export const ClassDemo: StoryObj<PackageClassDemoProps> = {
  args: {
    packageId: 'ui_level3',
    className: 'button',
  },
  argTypes: {
    packageId: {
      control: 'select',
      options: ['shared', 'ui_home', 'ui_header', 'ui_footer', 'ui_level2', 'ui_level3', 'ui_level4', 'ui_level5', 'ui_level6', 'admin_panel', 'code_editor', 'css_designer'],
    },
    className: {
      control: 'select',
      options: ['button', 'card', 'table', 'input', 'panel'],
    },
  },
  render: ({ packageId, className }) => (
    <div className="card">
      <h3>Package-Prefixed Class Example</h3>
      <p>
        Base class: <code>.{className}</code>
      </p>
      <p>
        Package-prefixed class: <code>.{packageId}_{className}</code>
      </p>
      <p>
        Combined usage: <code>className="{className} {packageId}_{className}"</code>
      </p>
    </div>
  ),
}
