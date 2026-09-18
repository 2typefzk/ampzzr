import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

interface SegmentedControlProps {
  options: string[];
  value?: string;
}

function SegmentedControl({ options, value }: SegmentedControlProps) {
  const [active, setActive] = useState(value ?? options[0]);
  return (
    <div className="st-seg">
      {options.map((o) => (
        <button key={o} className={'st-seg-btn' + (active === o ? ' active' : '')} onClick={() => setActive(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

const meta = {
  title: 'Actions/SegmentedControl',
  component: SegmentedControl,
  parameters: { layout: 'padded' },
  args: { options: ['Escuro', 'Claro', 'Sistema'] },
} satisfies Meta<typeof SegmentedControl>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
