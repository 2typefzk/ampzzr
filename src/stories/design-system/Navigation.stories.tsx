import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TopBar, Sidebar } from '../../components/Shell';
import type { TweakSettings } from '../../types';

const DEFAULT_T: TweakSettings = {
  accent: '#e8602a',
  theme: 'escuro',
  bg: 'berinjela',
  radius: 'medio',
  amplia: 'on',
  modelos: 'on',
  modelillos: 'on',
  novoaudio: 'on',
  heroanim: 'on',
};

function Shell() {
  const [route, setRoute] = useState('dashboard');
  return (
    <div style={{ height: 560, display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <TopBar t={DEFAULT_T} onNew={() => {}} onOpenSettings={() => {}} onLogout={() => {}} />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar route={route} onNavigate={setRoute} onOpenAmplia={() => {}} ampliaEnabled />
        <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--tx-faint)', fontStyle: 'italic', fontSize: 13 }}>
          tela: {route}
        </div>
      </div>
    </div>
  );
}

function SidebarDemo() {
  const [route, setRoute] = useState('audios');
  return (
    <div style={{ height: 420, display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <Sidebar route={route} onNavigate={setRoute} onOpenAmplia={() => {}} ampliaEnabled />
    </div>
  );
}

const meta = {
  title: 'Navigation/Shell',
  component: Shell,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Shell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TopBarAndSidebar: Story = {};

export const SidebarOnly: Story = {
  render: () => <SidebarDemo />,
};
