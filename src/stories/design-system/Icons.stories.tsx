import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';

function IconGallery() {
  const names = Object.keys(Icon) as (keyof typeof Icon)[];
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
        gap: 4,
      }}
    >
      {names.map((name) => (
        <div
          key={name}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            padding: '16px 8px',
            borderRadius: 'var(--r)',
            border: '1px solid var(--line)',
            color: 'var(--cream)',
          }}
        >
          {Icon[name]({ style: { width: 22, height: 22 } })}
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--tx-faint)' }}>{name}</span>
        </div>
      ))}
    </div>
  );
}

const meta = {
  title: 'Foundations/Icons',
  component: IconGallery,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof IconGallery>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllIcons: Story = {};
