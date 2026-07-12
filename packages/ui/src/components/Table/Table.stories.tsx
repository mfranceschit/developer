import type { Meta, StoryObj } from '@storybook/react-vite';
import { Table } from './Table';

type Project = { id: string; name: string; status: string };

const PROJECTS: Project[] = [
  { id: '1', name: 'Portfolio', status: 'published' },
  { id: '2', name: 'Admin Studio', status: 'draft' },
];

const meta: Meta<typeof Table<Project>> = {
  title: 'Components/Table',
  component: Table<Project>,
  args: {
    rows: PROJECTS,
    getRowKey: (row: Project) => row.id,
    columns: [
      { header: 'Name', render: (row: Project) => row.name },
      { header: 'Status', render: (row: Project) => row.status, align: 'right' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Table<Project>>;

export const Default: Story = {};

export const Clickable: Story = {
  args: { onRowClick: (row: Project) => alert(row.name) },
};
