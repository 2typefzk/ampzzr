import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';

interface NotificationItemProps {
  tone: 'ok' | 'info' | 'warn';
  title: string;
  body: string;
  time: string;
  unread?: boolean;
}

function NotificationItem({ tone, title, body, time, unread }: NotificationItemProps) {
  const icon = tone === 'ok' ? Icon.check : tone === 'warn' ? Icon.chat : Icon.waveform;
  return (
    <button className={'nt-item' + (unread ? ' unread' : '')} style={{ width: 340 }}>
      <span className={'nt-ic nt-' + tone}>{icon({ style: { width: 17, height: 17 } })}</span>
      <span className="nt-body">
        <span className="nt-row">
          <span className="nt-title">{title}</span>
          {unread && <span className="nt-dot" />}
        </span>
        <span className="nt-text">{body}</span>
        <span className="nt-time">{time}</span>
      </span>
    </button>
  );
}

const meta = {
  title: 'Feedback/Notification',
  component: NotificationItem,
  parameters: { layout: 'padded' },
  args: {
    tone: 'ok',
    title: 'Áudio aprovado',
    body: '"Casas Bahia — Semana do Cliente" foi aprovado pelo cliente.',
    time: 'agora',
    unread: true,
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const List: Story = {
  render: () => (
    <div className="nt-pop" style={{ position: 'static', width: 360 }}>
      <div className="nt-head">
        <span className="nt-head-title">Notificações</span>
        <span className="nt-head-count">1 nova</span>
      </div>
      <div className="nt-list">
        <NotificationItem tone="ok" title="Áudio aprovado" body="“Casas Bahia — Semana do Cliente” foi aprovado pelo cliente." time="agora" unread />
        <NotificationItem tone="info" title="Renderização concluída" body="Seu spot de 30s está pronto para download." time="há 2 h" />
        <NotificationItem tone="warn" title="Resposta no chamado #1820" body="A equipe Fuzzr respondeu sua solicitação de apoio." time="ontem" />
      </div>
    </div>
  ),
};

export const Toast: Story = {
  render: () => (
    <div className="sp-toast" style={{ position: 'static' }}>
      {Icon.check({ style: { width: 16, height: 16 } })} Alterações salvas
    </div>
  ),
};
