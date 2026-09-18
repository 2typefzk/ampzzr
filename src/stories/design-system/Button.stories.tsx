import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';

interface ButtonProps {
  label: string;
  variant: 'btn-primary' | 'btn-ghost' | 'btn-subtle';
  size?: 'btn-sm' | '' | 'btn-lg';
  withIcon?: boolean;
  disabled?: boolean;
}

function Button({ label, variant, size = '', withIcon, disabled }: ButtonProps) {
  return (
    <button className={['btn', variant, size].filter(Boolean).join(' ')} disabled={disabled}>
      {withIcon && Icon.plus()}
      {label}
    </button>
  );
}

const meta = {
  title: 'Actions/Button',
  component: Button,
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'select', options: ['btn-primary', 'btn-ghost', 'btn-subtle'] },
    size: { control: 'select', options: ['btn-sm', '', 'btn-lg'] },
  },
  args: { label: 'Novo Áudio', variant: 'btn-primary', size: '', withIcon: true, disabled: false },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Novo Áudio" variant="btn-primary" withIcon />
      <Button label="Cancelar" variant="btn-ghost" />
      <Button label="Ver tudo" variant="btn-subtle" />
      <Button label="Processando" variant="btn-primary" disabled />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
      <Button label="Baixar" variant="btn-primary" size="btn-lg" />
      <Button label="Baixar" variant="btn-primary" />
      <Button label="Baixar" variant="btn-primary" size="btn-sm" />
    </div>
  ),
};

export const IconOnly: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button className="icon-btn" aria-label="Editar">{Icon.pencil()}</button>
      <button className="icon-btn accent" aria-label="Adicionar">{Icon.plus()}</button>
      <button className="icon-btn" aria-label="Mais opções">{Icon.more()}</button>
    </div>
  ),
};
