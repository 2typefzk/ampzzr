import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';

interface DropZoneProps {
  cta: string;
  hint: string;
  dragover?: boolean;
}

function DropZone({ cta, hint, dragover }: DropZoneProps) {
  return (
    <div
      className={'na-surface na-drop' + (dragover ? ' dragover' : '')}
      style={{ minHeight: 208, width: 320 }}
      role="button"
    >
      <span className="na-surface-eyebrow">Importar roteiro</span>
      <div className="na-drop-center">
        <span className="na-drop-ic">{Icon.upload({ style: { width: 24, height: 24 } })}</span>
        <span className="na-drop-cta">
          <u>{cta}</u> ou selecione
        </span>
        <span className="na-drop-hint">{hint}</span>
      </div>
    </div>
  );
}

const meta = {
  title: 'Patterns/DropZone',
  component: DropZone,
  parameters: { layout: 'padded' },
  args: { cta: 'Arraste até aqui', hint: 'DOC ou TXT' },
  decorators: [
    (Story) => (
      // .na-drop is always rendered on the always-dark hero banner — it isn't
      // theme-reactive, so we give it that same fixed dark backdrop here.
      <div style={{ background: '#08060e', padding: 24, borderRadius: 'var(--r-lg)' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DropZone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rest: Story = {};

export const DragOver: Story = {
  args: { dragover: true },
};
