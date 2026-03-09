import type { Meta, StoryObj } from '@storybook/react';
import TextField from './TextField';

const meta = {
  title: 'Atoms/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'outlined', 'filled'],
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Text Field',
    placeholder: 'Enter text...',
    variant: 'outlined',
  },
};

export const Email: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'user@example.com',
    variant: 'outlined',
  },
};

export const WithError: Story = {
  args: {
    label: 'Name',
    error: true,
    helperText: 'This field is required',
    variant: 'outlined',
  },
};

export const Multiline: Story = {
  args: {
    label: 'Description',
    multiline: true,
    rows: 4,
    placeholder: 'Enter description...',
    variant: 'outlined',
  },
};
