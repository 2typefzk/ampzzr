import type { Meta, StoryObj } from '@storybook/react-vite';
import { TRILHA_GENRES, CHAMADO_STATUS } from '../../data/mockData';

interface TagProps {
  label: string;
  active?: boolean;
  dotColor?: string;
}

function Tag({ label, active, dotColor }: TagProps) {
  return (
    <span className={'tag' + (active ? ' orange' : '')}>
      {dotColor && <span className="dot" style={{ background: dotColor }} />}
      {label}
    </span>
  );
}

const meta = {
  title: 'Data display/Tag',
  component: Tag,
  parameters: { layout: 'padded' },
  args: { label: 'Rádio / In-Store' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const NeutralAndActive: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <Tag label="Rádio / In-Store" />
      <Tag label="Ativo" active />
    </div>
  ),
};

export const TrilhaGenres: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {Object.values(TRILHA_GENRES).map((c) => (
        <Tag key={c.id} label={c.name} dotColor={c.color} />
      ))}
    </div>
  ),
};

export const ChamadoStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {Object.values(CHAMADO_STATUS).map((c) => (
        <Tag key={c.id} label={c.name} dotColor={c.color} />
      ))}
    </div>
  ),
};
