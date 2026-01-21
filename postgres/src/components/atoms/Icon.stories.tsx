import type { Meta, StoryObj } from '@storybook/react';
import Icon from './Icon';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'action', 'disabled', 'error'],
    },
    fontSize: {
      control: 'select',
      options: ['small', 'medium', 'large', 'inherit'],
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Storage: Story = {
  args: {
    name: 'Storage',
    color: 'primary',
  },
};

export const Code: Story = {
  args: {
    name: 'Code',
    fontSize: 'large',
  },
};

export const AccountTree: Story = {
  args: {
    name: 'AccountTree',
    color: 'secondary',
  },
};

export const Speed: Story = {
  args: {
    name: 'Speed',
    color: 'error',
    fontSize: 'large',
  },
};
