import type { Meta, StoryObj } from '@storybook/react-vite';
import { StepRail } from '../../components/Shell';

const meta = {
  title: 'Navigation/Stepper',
  component: StepRail,
  parameters: { layout: 'padded' },
  args: { railStep: 2 },
  argTypes: { railStep: { control: { type: 'range', min: 1, max: 3, step: 1 } } },
} satisfies Meta<typeof StepRail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div style={{ background: 'var(--ink-950)', padding: '18px 0' }}>
      <StepRail {...args} />
    </div>
  ),
};

export const AllSteps: Story = {
  render: () => (
    <div style={{ background: 'var(--ink-950)', padding: '18px 0', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <StepRail railStep={1} />
      <StepRail railStep={2} />
      <StepRail railStep={3} />
    </div>
  ),
};
