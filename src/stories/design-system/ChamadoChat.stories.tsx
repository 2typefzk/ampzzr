import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChamadoChat } from '../../components/Chamados';
import { CHAMADO_LIB } from '../../data/mockData';

const meta = {
  title: 'Patterns/ChamadoChat',
  component: ChamadoChat,
  parameters: { layout: 'fullscreen' },
  args: {
    chamado: CHAMADO_LIB[0],
    onClose: () => {},
    onChoose: () => {},
    onReply: () => {},
  },
} satisfies Meta<typeof ChamadoChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
