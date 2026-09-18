import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';

function PopoverMenu() {
  return (
    <div className="mm-menu" style={{ position: 'static' }}>
      <button className="mm-item">{Icon.search({ style: { width: 15, height: 15 } })} Ver detalhes</button>
      <button className="mm-item">{Icon.flag({ style: { width: 15, height: 15 } })} Adicionar Campanha</button>
      <button className="mm-item">{Icon.copy({ style: { width: 15, height: 15 } })} Duplicar</button>
      <div className="mm-sep" />
      <button className="mm-item danger">{Icon.trash({ style: { width: 15, height: 15 } })} Excluir</button>
    </div>
  );
}

const meta = {
  title: 'Navigation/PopoverMenu',
  component: PopoverMenu,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PopoverMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
