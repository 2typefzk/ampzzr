import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AudioTable } from '../../screens/MyAudios';
import { LIBRARY } from '../../data/mockData';

function DataTable() {
  const [sortKey, setSortKey] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const onSort = (k: string) => {
    if (k === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(k);
      setSortDir('asc');
    }
  };
  return <AudioTable list={LIBRARY} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />;
}

const meta = {
  title: 'Data display/DataTable',
  component: DataTable,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
