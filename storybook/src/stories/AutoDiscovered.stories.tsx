/**
 * Auto-Discovered Packages
 *
 * Demonstrates package-prefixed styling from V2 schemas
 */

import type { Meta, StoryObj } from '@storybook/react'

interface ButtonProps {
  packageId: string
  label: string
}

interface CardProps {
  packageId: string
  title: string
  content: string
}

interface TableProps {
  packageId: string
}

const meta: Meta = {
  title: 'Auto-Discovered Packages',
  parameters: {
    layout: 'centered',
  },
}

export default meta

/**
 * Button - Package-themed buttons
 */
export const Button: StoryObj<ButtonProps> = {
  args: {
    packageId: 'ui_level3',
    label: 'Button',
  },
  argTypes: {
    packageId: {
      control: 'select',
      options: ['shared', 'ui_home', 'ui_header', 'ui_footer', 'ui_level2', 'ui_level3', 'ui_level4', 'ui_level5', 'ui_level6', 'admin_panel', 'code_editor', 'css_designer'],
    },
    label: { control: 'text' },
  },
  render: ({ packageId, label }) => (
    <button className={`button ${packageId}_button`}>
      {label}
    </button>
  ),
}

/**
 * Card - Package-themed cards
 */
export const Card: Story = {
  args: {
    packageId: 'ui_level3',
    title: 'Card Title',
    content: 'Card content goes here',
  },
  argTypes: {
    packageId: {
      control: 'select',
      options: ['shared', 'ui_home', 'ui_header', 'ui_footer', 'ui_level2', 'ui_level3', 'ui_level4', 'ui_level5', 'ui_level6', 'admin_panel', 'code_editor', 'css_designer'],
    },
    title: { control: 'text' },
    content: { control: 'text' },
  },
  render: ({ packageId, title, content }) => (
    <div className={`card ${packageId}_card`}>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  ),
}

/**
 * Table - Package-themed tables
 */
export const Table: Story = {
  args: {
    packageId: 'ui_level3',
  },
  argTypes: {
    packageId: {
      control: 'select',
      options: ['shared', 'ui_home', 'ui_header', 'ui_footer', 'ui_level2', 'ui_level3', 'ui_level4', 'ui_level5', 'ui_level6', 'admin_panel', 'code_editor', 'css_designer'],
    },
  },
  render: ({ packageId }) => (
    <table className={`table ${packageId}_table`}>
      <thead>
        <tr>
          <th>Component</th>
          <th>Class</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Button</td>
          <td><code>.{packageId}_button</code></td>
        </tr>
        <tr>
          <td>Card</td>
          <td><code>.{packageId}_card</code></td>
        </tr>
        <tr>
          <td>Table</td>
          <td><code>.{packageId}_table</code></td>
        </tr>
      </tbody>
    </table>
  ),
}
