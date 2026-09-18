import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

interface CheckboxProps {
  checked?: boolean;
}

function Checkbox({ checked }: CheckboxProps) {
  const [on, setOn] = useState(!!checked);
  return (
    <label className="be-check">
      <input type="checkbox" checked={on} onChange={() => setOn((v) => !v)} />
      <span />
    </label>
  );
}

const meta = {
  title: 'Actions/Checkbox',
  component: Checkbox,
  parameters: { layout: 'padded' },
  args: { checked: false },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OffOn: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Checkbox checked={false} />
        <div style={{ fontSize: 12, color: 'var(--tx-muted)', marginTop: 8 }}>off</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Checkbox checked />
        <div style={{ fontSize: 12, color: 'var(--tx-muted)', marginTop: 8 }}>on</div>
      </div>
    </div>
  ),
};
