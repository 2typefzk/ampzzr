import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendLabel?: string;
}

function StatCard({ label, value, trend, trendLabel }: StatCardProps) {
  return (
    <div className="bn-card">
      <div className="bn-top">
        <span className="bn-label">{label}</span>
        <span className="bn-ic">{Icon.waveform({ style: { width: 17, height: 17 } })}</span>
      </div>
      <div className="bn-value">{value}</div>
      {trend && (
        <div className="bn-foot">
          <span className="bn-trend">
            {Icon.arrowUp({ style: { width: 13, height: 13 } })}
            {trend}
          </span>
          {trendLabel}
        </div>
      )}
    </div>
  );
}

const meta = {
  title: 'Data display/StatCard',
  component: StatCard,
  parameters: { layout: 'padded' },
  args: { label: 'Áudios criados', value: '128', trend: '12%', trendLabel: 'vs. mês anterior' },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const DashboardGrid: Story = {
  render: () => (
    <div className="bn-grid" style={{ maxWidth: 900 }}>
      <StatCard label="Áudios criados" value="128" trend="12%" trendLabel="vs. mês anterior" />
      <StatCard label="Em rascunho" value="6" />
      <StatCard label="Campanhas ativas" value="9" trend="3%" trendLabel="vs. mês anterior" />
      <StatCard label="Chamados abertos" value="2" />
    </div>
  ),
};
