import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChamadoModal } from '../../components/Chamados';

const meta = {
  title: 'Feedback/Modal',
  component: ChamadoModal,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ChamadoModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NovoChamado: Story = {
  args: {
    target: null,
    onClose: () => {},
    onSubmit: () => {},
  },
};
