import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo, useState } from 'react';
import { Icon } from '../../components/Icon';
import { MiniWave } from '../../components/Waveform';
import { makeWaveBars } from '../../lib/audioEngine';

interface AudioPlayerProps {
  fileName: string;
  duration: string;
  current: string;
}

// Uses MiniWave (a static canvas waveform) as a stand-in for the real
// scrubbable <Waveform>, which needs a live player/seek controller wired up.
function AudioPlayer({ fileName, duration, current }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const bars = useMemo(() => makeWaveBars(48, 11), []);
  return (
    <div className="au-area filled" style={{ width: 340 }}>
      <div className="au-head">
        <span className="au-file-ic">{Icon.music({ style: { width: 16, height: 16 } })}</span>
        <span className="au-file-name">{fileName}</span>
        <span className="au-file-dur mono">{duration}</span>
        <button className="au-remove" title="Remover áudio">{Icon.trash({ style: { width: 15, height: 15 } })}</button>
      </div>
      <div className="au-player">
        <button className="au-play" onClick={() => setPlaying((p) => !p)}>
          {playing ? Icon.pause({ style: { width: 20, height: 20 } }) : Icon.play({ style: { width: 20, height: 20 } })}
        </button>
        <div className="au-wave">
          <MiniWave bars={bars} active={playing} height={40} />
        </div>
        <span className="au-time mono">{current}</span>
      </div>
    </div>
  );
}

const meta = {
  title: 'Patterns/AudioPlayer',
  component: AudioPlayer,
  parameters: { layout: 'padded' },
  args: { fileName: 'casas-bahia-semana-cliente.mp3', duration: '00:30', current: '00:12' },
} satisfies Meta<typeof AudioPlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};
