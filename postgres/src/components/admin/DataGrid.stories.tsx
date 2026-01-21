import type { Meta, StoryObj } from '@storybook/react';
import DataGrid from './DataGrid';

const meta = {
  title: 'Admin/DataGrid',
  component: DataGrid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DataGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

// Stories based on features.json storybookStories.DataGrid
export const Default: Story = {
  name: 'Default',
  args: {
    columns: [
      { name: 'id', label: 'ID' },
      { name: 'name', label: 'Name' },
      { name: 'email', label: 'Email' },
    ],
    rows: [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
    ],
    primaryKey: 'id',
  },
};

export const WithActions: Story = {
  name: 'With Edit/Delete Actions',
  args: {
    columns: [
      { name: 'id', label: 'ID' },
      { name: 'name', label: 'Name' },
      { name: 'status', label: 'Status' },
    ],
    rows: [
      { id: 1, name: 'Active User', status: 'active' },
      { id: 2, name: 'Pending User', status: 'pending' },
    ],
    onEdit: () => console.log('Edit clicked'),
    onDelete: () => console.log('Delete clicked'),
    primaryKey: 'id',
  },
};

export const Empty: Story = {
  name: 'Empty State',
  args: {
    columns: [
      { name: 'id', label: 'ID' },
      { name: 'name', label: 'Name' },
    ],
    rows: [],
  },
};
