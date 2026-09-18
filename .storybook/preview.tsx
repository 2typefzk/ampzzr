import type { Preview, Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';

// Same import order as src/main.tsx — screens2.css and the rest build on
// the tokens/resets styles3.css defines first.
import '../src/styles/styles3.css';
import '../src/styles/screens2.css';
import '../src/styles/dash.css';
import '../src/styles/batch.css';
import '../src/styles/amplia.css';
import '../src/styles/chamados.css';
import '../src/styles/auth.css';
import './storybook.css';

function ThemeSync({ theme, bg, radius }: { theme: string; bg: string; radius: string }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    if (theme === 'claro') root.setAttribute('data-theme', 'light');
    else root.removeAttribute('data-theme');
    if (bg && bg !== 'berinjela') root.setAttribute('data-bg', bg);
    else root.removeAttribute('data-bg');
    if (radius && radius !== 'medio') root.setAttribute('data-radius', radius);
    else root.removeAttribute('data-radius');
    const t = setTimeout(() => root.classList.remove('theme-switching'), 200);
    return () => clearTimeout(t);
  }, [theme, bg, radius]);
  return null;
}

const withAmpliTheme: Decorator = (Story, context) => {
  const { theme, bg, radius } = context.globals;
  return (
    <>
      <ThemeSync theme={theme} bg={bg} radius={radius} />
      <div className="is-loaded" style={{ background: 'var(--ink-900)', color: 'var(--tx)', minHeight: '100%' }}>
        <Story />
      </div>
    </>
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
    backgrounds: { disable: true },
    layout: 'padded',
  },
  globalTypes: {
    theme: {
      name: 'Tema',
      description: 'Ampli color theme (data-theme)',
      defaultValue: 'escuro',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'escuro', title: 'Escuro' },
          { value: 'claro', title: 'Claro' },
        ],
        dynamicTitle: true,
      },
    },
    bg: {
      name: 'Fundo',
      description: 'Ampli dark background tone (data-bg) — only visible in Escuro',
      defaultValue: 'berinjela',
      toolbar: {
        icon: 'paintbrush',
        items: [
          { value: 'berinjela', title: 'Berinjela (padrão)' },
          { value: 'grafite', title: 'Grafite' },
          { value: 'petroleo', title: 'Petróleo' },
        ],
        dynamicTitle: true,
      },
    },
    radius: {
      name: 'Raio',
      description: 'Ampli corner-radius preset (data-radius)',
      defaultValue: 'medio',
      toolbar: {
        icon: 'component',
        items: [
          { value: 'reto', title: 'Reto' },
          { value: 'medio', title: 'Médio (padrão)' },
          { value: 'suave', title: 'Suave' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withAmpliTheme],
};

export default preview;
