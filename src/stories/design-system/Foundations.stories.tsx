import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Foundations/Overview',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h2
        className="display"
        style={{ fontSize: 22, color: 'var(--cream)', margin: '0 0 18px', letterSpacing: '-0.005em' }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({ name, varName, sub }: { name: string; varName: string; sub?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 148 }}>
      <div
        style={{
          height: 64,
          borderRadius: 'var(--r)',
          background: `var(${varName})`,
          border: '1px solid var(--line)',
        }}
      />
      <div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--cream-dim)' }}>{varName}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--tx-faint)', marginTop: 2 }}>{sub}</div>}
      </div>
      {!name.startsWith('-') && null}
    </div>
  );
}

export const Colors: Story = {
  render: () => (
    <div>
      <Section title="Ink scale — surfaces">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {['950', '900', '850', '800', '750', '700', '650'].map((step) => (
            <Swatch key={step} name={step} varName={`--ink-${step}`} sub={step === '900' ? 'app background' : step === '800' ? 'cards' : undefined} />
          ))}
        </div>
      </Section>
      <Section title="Accent — orange (constant in every theme)">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Swatch name="orange" varName="--orange" sub="primary accent" />
          <Swatch name="orange-bright" varName="--orange-bright" sub="hover" />
          <Swatch name="orange-press" varName="--orange-press" sub="active" />
          <Swatch name="orange-soft" varName="--orange-soft" sub="14% fill" />
          <Swatch name="orange-softer" varName="--orange-softer" sub="8% fill" />
        </div>
      </Section>
      <Section title="Text & headings">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Swatch name="cream" varName="--cream" sub="headings" />
          <Swatch name="cream-dim" varName="--cream-dim" sub="secondary headings" />
          <Swatch name="tx" varName="--tx" sub="body text" />
          <Swatch name="tx-muted" varName="--tx-muted" sub="secondary body" />
          <Swatch name="tx-faint" varName="--tx-faint" sub="placeholders" />
        </div>
      </Section>
      <Section title="Lines">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Swatch name="line" varName="--line" sub="default hairline" />
          <Swatch name="line-strong" varName="--line-strong" sub="emphasized" />
          <Swatch name="line-orange" varName="--line-orange" sub="accent / focus" />
        </div>
      </Section>
      <Section title="Ampl.IA — self-contained sub-brand (never themed)">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          <Swatch name="ai-lilac" varName="--ai-lilac" />
          <Swatch name="ai-cyan" varName="--ai-cyan" />
          <Swatch name="ai-green" varName="--ai-green" />
          <Swatch name="ai-ink" varName="--ai-ink" sub="window bg" />
          <Swatch name="ai-panel" varName="--ai-panel" sub="assistant bubble" />
        </div>
      </Section>
      <p style={{ fontSize: 12.5, color: 'var(--tx-faint)', marginTop: 8 }}>
        Use the <strong>Tema</strong> / <strong>Fundo</strong> toolbar controls above to check every swatch in{' '}
        <em>Claro</em>, <em>Grafite</em> and <em>Petróleo</em> — the ink and text steps repaint, <code>orange</code>{' '}
        and the Ampl.IA colors never do.
      </p>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div>
      <Section title="Display — Archivo, condensed width axis, uppercase">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="display" style={{ fontSize: 72, fontStretch: '78%', color: 'var(--cream)' }}>
            Ampli 72<span className="lt">px</span>
          </div>
          <div className="display" style={{ fontSize: 54, fontStretch: '78%', color: 'var(--cream)' }}>
            Ampli 54px
          </div>
          <div className="display" style={{ fontSize: 34, fontStretch: '80%', color: 'var(--cream)' }}>
            Ampli 34px
          </div>
        </div>
      </Section>
      <Section title="Labels">
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <span className="u-label">Label</span>
          <span className="u-eyebrow">Eyebrow</span>
        </div>
      </Section>
      <Section title="Body & mono">
        <p style={{ fontSize: 14.5, color: 'var(--tx)', maxWidth: 480, lineHeight: 1.5 }}>
          Corpo padrão em Archivo, peso 400. <span style={{ color: 'var(--tx-muted)', fontStyle: 'italic' }}>
            Subtítulos e apoio ficam em itálico, tx-muted.
          </span>
        </p>
        <p style={{ fontFamily: 'var(--mono)', fontSize: 12.5, color: 'var(--cream-dim)' }}>00:30 · 1.2 MB · #A83F21</p>
      </Section>
    </div>
  ),
};

export const RadiusAndShadow: Story = {
  render: () => (
    <div>
      <Section title="Radius scale">
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {[
            ['--r-sm', '7px'],
            ['--r', '11px'],
            ['--r-lg', '18px'],
            ['--r-xl', '24px'],
          ].map(([v, px]) => (
            <div key={v} style={{ textAlign: 'center' }}>
              <div style={{ width: 84, height: 84, background: 'var(--ink-800)', border: '1px solid var(--line)', borderRadius: `var(${v})` }} />
              <div style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--tx-faint)', marginTop: 8 }}>
                {v} · {px}
              </div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--tx-faint)', marginTop: 14 }}>
          Toggle <strong>Raio</strong> in the toolbar (Reto / Médio / Suave) — every radius on this page scales
          together, since it's one dial in Ampli, not per-component overrides.
        </p>
      </Section>
      <Section title="Shadow">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            ['--shadow-sm', 'sm'],
            ['--shadow', 'default'],
            ['--shadow-lg', 'lg'],
          ].map(([v, label]) => (
            <div
              key={v}
              style={{
                width: 140,
                height: 80,
                background: 'var(--ink-800)',
                borderRadius: 'var(--r-lg)',
                boxShadow: `var(${v})`,
                display: 'grid',
                placeItems: 'center',
                fontFamily: 'var(--mono)',
                fontSize: 11.5,
                color: 'var(--tx-faint)',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </Section>
    </div>
  ),
};
