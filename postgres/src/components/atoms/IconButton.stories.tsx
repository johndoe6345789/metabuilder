import type { Meta, StoryObj } from '@storybook/react';
import IconButton from './IconButton';

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Edit: Story = {
  args: {
    icon: 'Edit',
    color: 'primary',
  },
};

export const Delete: Story = {
  args: {
    icon: 'Delete',
    color: 'error',
  },
};

export const Add: Story = {
  args: {
    icon: 'Add',
    color: 'primary',
  },
};

export const Settings: Story = {
  args: {
    icon: 'Settings',
    size: 'large',
  },
};
