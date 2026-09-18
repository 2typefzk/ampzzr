import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { MiniWave } from '../../components/Waveform';
import { makeWaveBars } from '../../lib/audioEngine';
import { LIBRARY } from '../../data/mockData';
import { ModelTag, CampaignLabel, typeIcon } from '../../screens/MyAudios';
import type { LibraryAudio } from '../../types';

function ContentCard({ a }: { a: LibraryAudio }) {
  const bars = useMemo(() => makeWaveBars(56, a.id.charCodeAt(1) * 7 + a.trechos), [a.id, a.trechos]);
  const [hover, setHover] = useState(false);
  const isBatch = a.kind === 'batch';
  return (
    <div
      className="ac-card"
      style={{ width: 320 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="ac-top">
        <ModelTag id={a.model} sm />
        <span style={{ flex: 1 }} />
        {a.status === 'rascunho' && (
          <span className="tag" style={{ height: 24, fontSize: 10.5, color: 'var(--tx-faint)' }}>
            Rascunho
          </span>
        )}
        <button className="ac-more icon-btn" style={{ width: 30, height: 30, border: 'none' }}>
          {Icon.more()}
        </button>
      </div>
      <div className="ac-head2">
        <h3 className="ac-name">{a.name}</h3>
        <CampaignLabel name={a.campaign} />
      </div>
      <div className="ac-wave">
        <button className="ac-play">{Icon.play()}</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <MiniWave bars={bars} active={hover} height={30} />
        </div>
      </div>
      <p className="ac-text">{a.text}</p>
      <div className="ac-foot">
        <span className="ac-meta ac-type">
          {typeIcon(a.kind, { width: 14, height: 14 })}
          {isBatch ? (
            <span>
              {a.variations} {a.variations === 1 ? 'variação' : 'variações'}
            </span>
          ) : (
            <span className="mono">{a.dur}</span>
          )}
        </span>
        <span style={{ flex: 1 }} />
        <span className="ac-date">{a.date}</span>
      </div>
    </div>
  );
}

const meta = {
  title: 'Data display/ContentCard',
  component: ContentCard,
  parameters: { layout: 'padded' },
  args: { a: LIBRARY[0] },
} satisfies Meta<typeof ContentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const BatchVariant: Story = {
  args: { a: LIBRARY.find((l) => l.kind === 'batch')! },
};

export const Grid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18, maxWidth: 1000 }}>
      {LIBRARY.slice(0, 4).map((a) => (
        <ContentCard key={a.id} a={a} />
      ))}
    </div>
  ),
};
