import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

interface SwitchProps {
  label: string;
  on?: boolean;
}

function Switch({ label, on }: SwitchProps) {
  const [checked, setChecked] = useState(!!on);
  return (
    <button className={'st-switch' + (checked ? ' on' : '')} onClick={() => setChecked((v) => !v)}>
      <span className="st-switch-knob" />
      <span className="st-switch-txt">{label}</span>
    </button>
  );
}

const meta = {
  title: 'Actions/Switch',
  component: Switch,
  parameters: { layout: 'padded' },
  args: { label: 'Notificações por e-mail', on: false },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const InSettingsRows: Story = {
  render: () => (
    <div className="st-block" style={{ maxWidth: 420 }}>
      <div className="st-rows">
        <div className="st-row">
          <div className="st-row-info">
            <div className="st-row-title">Áudio em Lote na Home</div>
            <div className="st-row-desc">Mostra o atalho de upload em lote na tela inicial.</div>
          </div>
          <div className="st-row-control">
            <Switch label="" on={false} />
          </div>
        </div>
        <div className="st-row">
          <div className="st-row-info">
            <div className="st-row-title">Notificações por e-mail</div>
            <div className="st-row-desc">Receba um resumo quando um áudio for aprovado.</div>
          </div>
          <div className="st-row-control">
            <Switch label="" on />
          </div>
        </div>
      </div>
    </div>
  ),
};
