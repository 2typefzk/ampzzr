import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Icon } from '../../components/Icon';

interface SliderProps {
  label: string;
  min?: number;
  max?: number;
  value?: number;
  unit?: string;
  ticks?: [string, string];
  disabled?: boolean;
}

function Slider({ label, min = 0, max = 100, value = 50, unit = '%', ticks, disabled }: SliderProps) {
  const [v, setV] = useState(value);
  const pct = ((v - min) / (max - min)) * 100;
  return (
    <div className={'sld' + (disabled ? ' disabled' : '')} style={{ maxWidth: 320 }}>
      <div className="sld-top">
        <span className="sld-label">
          {Icon.speed({ style: { width: 16, height: 16 } })}
          {label}
        </span>
        <span className="sld-val">
          {v}
          {unit}
        </span>
      </div>
      <input
        className="sld-input"
        type="range"
        min={min}
        max={max}
        value={v}
        disabled={disabled}
        onChange={(e) => setV(Number(e.target.value))}
        style={{ ['--pct' as string]: `${pct}%` }}
      />
      {ticks && (
        <div className="sld-ticks">
          <span>{ticks[0]}</span>
          <span>{ticks[1]}</span>
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Actions/Slider',
  component: Slider,
  parameters: { layout: 'padded' },
  args: { label: 'Energia', value: 64, ticks: ['Calmo', 'Enérgico'] },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const FineTuneStack: Story = {
  render: () => (
    <div className="sp-sliders" style={{ maxWidth: 320 }}>
      <Slider label="Energia" value={64} ticks={['Calmo', 'Enérgico']} />
      <Slider label="Velocidade" value={45} ticks={['Lento', 'Rápido']} />
      <Slider label="Tom" value={30} ticks={['Grave', 'Agudo']} disabled />
    </div>
  ),
};
