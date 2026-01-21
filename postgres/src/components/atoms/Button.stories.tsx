import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'outlined', 'contained'],
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories based on features.json storybookStories
export const Primary: Story = {
  name: 'Primary Button',
  args: {
    variant: 'contained',
    color: 'primary',
    text: 'Click Me',
  },
};

export const Secondary: Story = {
  name: 'Secondary Button',
  args: {
    variant: 'outlined',
    color: 'secondary',
    text: 'Cancel',
  },
};

export const WithIcon: Story = {
  name: 'With Icon',
  args: {
    variant: 'contained',
    startIcon: 'Add',
    text: 'Add Item',
  },
};

export const Loading: Story = {
  name: 'Loading State',
  args: {
    variant: 'contained',
    disabled: true,
    text: 'Loading...',
  },
};
