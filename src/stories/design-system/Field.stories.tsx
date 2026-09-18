import type { Meta, StoryObj } from '@storybook/react-vite';

interface FieldProps {
  label: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
}

function Field({ label, placeholder, value, disabled }: FieldProps) {
  return (
    <div style={{ maxWidth: 320 }}>
      <div className="lg-field-label">{label}</div>
      <input className="field" placeholder={placeholder} defaultValue={value} disabled={disabled} />
    </div>
  );
}

const meta = {
  title: 'Actions/Field',
  component: Field,
  parameters: { layout: 'padded' },
  args: { label: 'E-mail', placeholder: 'voce@empresa.com' },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 320 }}>
      <Field label="E-mail" placeholder="voce@empresa.com" />
      <Field label="Cliente" value="Casas Bahia" disabled />
    </div>
  ),
};
