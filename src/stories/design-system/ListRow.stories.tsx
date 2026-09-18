import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon } from '../../components/Icon';
import { LIBRARY, MODELS } from '../../data/mockData';
import type { LibraryAudio } from '../../types';

function ListRow({ a }: { a: LibraryAudio }) {
  const m = MODELS[a.model] || MODELS.spot;
  return (
    <button className="dp-item">
      <span className="dp-play">{Icon.play()}</span>
      <span className="dp-main">
        <span className="dp-name">{a.name}</span>
        <span className="dp-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="mdot" style={{ background: m.color }} />
            {m.name}
          </span>
          <span className="dp-dot">·</span>
          <span className="mono">{a.dur}</span>
        </span>
      </span>
      <span className="dp-right">
        {a.status === 'rascunho' && <span className="dp-draft">Rascunho</span>}
        <span className="dp-date">{a.date}</span>
        <span className="dp-arrow">{Icon.chevRight({ style: { width: 18, height: 18 } })}</span>
      </span>
    </button>
  );
}

const meta = {
  title: 'Data display/ListRow',
  component: ListRow,
  parameters: { layout: 'padded' },
  args: { a: LIBRARY[0] },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const List: Story = {
  render: () => (
    <div className="dp-list" style={{ maxWidth: 420 }}>
      {LIBRARY.slice(0, 5).map((a) => (
        <ListRow key={a.id} a={a} />
      ))}
    </div>
  ),
};
