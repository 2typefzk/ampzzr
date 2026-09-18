import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AmpliaWindow, AmpliaLauncher } from '../../components/Amplia';

function AmpliaDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ position: 'relative', height: 640, background: 'var(--ink-900)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      {open && <AmpliaWindow onClose={() => setOpen(false)} />}
      <AmpliaLauncher open={open} onToggle={() => setOpen((o) => !o)} />
    </div>
  );
}

const meta = {
  title: "Patterns/Ampl.IA Assistant",
  component: AmpliaDemo,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AmpliaDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
