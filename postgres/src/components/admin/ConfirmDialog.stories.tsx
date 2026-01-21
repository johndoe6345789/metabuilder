import type { Meta, StoryObj } from '@storybook/react';
import ConfirmDialog from './ConfirmDialog';

const meta = {
  title: 'Admin/ConfirmDialog',
  component: ConfirmDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories based on features.json storybookStories.ConfirmDialog
export const Default: Story = {
  name: 'Default',
  args: {
    open: true,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    onConfirm: () => console.log('Confirmed'),
    onCancel: () => console.log('Cancelled'),
  },
};

export const DeleteWarning: Story = {
  name: 'Delete Warning',
  args: {
    open: true,
    title: 'Delete Item',
    message: 'This action cannot be undone. Are you sure you want to delete this item?',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel',
    onConfirm: () => console.log('Confirmed delete'),
    onCancel: () => console.log('Cancelled delete'),
  },
};
