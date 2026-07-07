/* ============================================================
   AMPLI — Icon set (minimal stroke icons)
   ============================================================ */
import type { CSSProperties, ReactElement, ReactNode, SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  sw?: number;
  style?: CSSProperties;
}

export type IconRenderer = (p?: IconProps) => ReactElement;

const _ic = (paths: ReactNode, props: IconProps = {}) => {
  const { sw, ...rest } = props;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw || 1.8}
      strokeLinecap="round" strokeLinejoin="round" {...rest}>{paths}</svg>
  );
};

export const Icon = {
  search: (p?: IconProps) => _ic(<><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></>, p),
  plus: (p?: IconProps) => _ic(<><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>, p),
  chevDown: (p?: IconProps) => _ic(<polyline points="6 9 12 15 18 9" />, p),
  chevRight: (p?: IconProps) => _ic(<polyline points="9 6 15 12 9 18" />, p),
  chevLeft: (p?: IconProps) => _ic(<polyline points="15 6 9 12 15 18" />, p),
  pencil: (p?: IconProps) => _ic(<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" /></>, p),
  upload: (p?: IconProps) => _ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></>, p),
  download: (p?: IconProps) => _ic(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>, p),
  play: (p?: IconProps) => _ic(<polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />, p),
  pause: (p?: IconProps) => _ic(<><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" /></>, p),
  music: (p?: IconProps) => _ic(<><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>, p),
  drag: (p?: IconProps) => _ic(<><circle cx="9" cy="6" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.3" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1.3" fill="currentColor" stroke="none" /></>, p),
  trash: (p?: IconProps) => _ic(<><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></>, p),
  close: (p?: IconProps) => _ic(<><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>, p),
  check: (p?: IconProps) => _ic(<polyline points="20 6 9 17 4 12" />, p),
  waveform: (p?: IconProps) => _ic(<><line x1="4" y1="10" x2="4" y2="14" /><line x1="8" y1="6" x2="8" y2="18" /><line x1="12" y1="3" x2="12" y2="21" /><line x1="16" y1="7" x2="16" y2="17" /><line x1="20" y1="10" x2="20" y2="14" /></>, p),
  copy: (p?: IconProps) => _ic(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, p),
  layers: (p?: IconProps) => _ic(<><polygon points="12 3 21 8 12 13 3 8 12 3" /><polyline points="3 13 12 18 21 13" /></>, p),
  more: (p?: IconProps) => _ic(<><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none" /></>, p),
  speed: (p?: IconProps) => _ic(<><path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" opacity="0" /><path d="M5 13a7 7 0 0 1 14 0" /><line x1="12" y1="13" x2="15.5" y2="9.5" /><circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none" /></>, p),
  volume: (p?: IconProps) => _ic(<><polygon points="3 9 7 9 12 4 12 20 7 15 3 15" fill="currentColor" stroke="none" /><path d="M16 8a5 5 0 0 1 0 8" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></>, p),
  grid: (p?: IconProps) => _ic(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>, p),
  refresh: (p?: IconProps) => _ic(<><polyline points="23 4 23 10 17 10" /><path d="M20.5 14a9 9 0 1 1-2.1-9.4L23 10" /></>, p),
  clock: (p?: IconProps) => _ic(<><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></>, p),
  mic: (p?: IconProps) => _ic(<><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="22" /></>, p),
  sparkle: (p?: IconProps) => _ic(<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" fill="currentColor" stroke="none" />, p),
  filter: (p?: IconProps) => _ic(<polygon points="3 4 21 4 14 12 14 19 10 21 10 12" />, p),
  arrowRight: (p?: IconProps) => _ic(<><line x1="4" y1="12" x2="20" y2="12" /><polyline points="14 6 20 12 14 18" /></>, p),
  thumbsUp: (p?: IconProps) => _ic(<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />, p),
  thumbsDown: (p?: IconProps) => _ic(<path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />, p),
  file: (p?: IconProps) => _ic(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>, p),
  help: (p?: IconProps) => _ic(<><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12" y2="17" /></>, p),
  sliders: (p?: IconProps) => _ic(<><line x1="6" y1="21" x2="6" y2="14" /><line x1="6" y1="10" x2="6" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="18" y1="21" x2="18" y2="16" /><line x1="18" y1="12" x2="18" y2="3" /><line x1="3" y1="14" x2="9" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="15" y1="16" x2="21" y2="16" /></>, p),
  table: (p?: IconProps) => _ic(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="3" y1="9.5" x2="21" y2="9.5" /><line x1="3" y1="14.5" x2="21" y2="14.5" /><line x1="10" y1="9.5" x2="10" y2="20" /></>, p),
  arrowUp: (p?: IconProps) => _ic(<><line x1="12" y1="19" x2="12" y2="5" /><polyline points="6 11 12 5 18 11" /></>, p),
  arrowDown: (p?: IconProps) => _ic(<><line x1="12" y1="5" x2="12" y2="19" /><polyline points="6 13 12 19 18 13" /></>, p),
  menu: (p?: IconProps) => _ic(<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>, p),
  panelLeft: (p?: IconProps) => _ic(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" /></>, p),
  panelLeftClose: (p?: IconProps) => _ic(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" /><polyline points="16 15 13 12 16 9" /></>, p),
  panelLeftOpen: (p?: IconProps) => _ic(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="9" y1="4" x2="9" y2="20" /><polyline points="14 9 17 12 14 15" /></>, p),
  columns: (p?: IconProps) => _ic(<><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="12" y1="4" x2="12" y2="20" /></>, p),
  doc: (p?: IconProps) => _ic(<><rect x="5" y="3" width="14" height="18" rx="2" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="9" y1="12" x2="15" y2="12" /><line x1="9" y1="16" x2="13" y2="16" /></>, p),
  flag: (p?: IconProps) => _ic(<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>, p),
  chat: (p?: IconProps) => _ic(<path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-3.9-.9L3 21l1.4-4.1A8.38 8.38 0 0 1 3.5 12a8.5 8.5 0 0 1 17 -.5z" />, p),
  chart: (p?: IconProps) => _ic(<><polyline points="3 3 3 21 21 21" /><polyline points="7 14 11 10 14 13 20 6" /></>, p),
  bell: (p?: IconProps) => _ic(<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>, p),
  user: (p?: IconProps) => _ic(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></>, p),
  logout: (p?: IconProps) => _ic(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>, p),
  cog: (p?: IconProps) => _ic(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>, p),
  library: (p?: IconProps) => _ic(<><rect x="3" y="3" width="7" height="18" rx="1.5" /><rect x="13" y="3" width="3.5" height="18" rx="1.2" /><path d="M19 5l2.4 14.5" /></>, p),
  amplia: ({ style }: { style?: CSSProperties } = {}) => (
    <svg viewBox="0 0 48 48" style={style} fill="none">
      <defs>
        <linearGradient id="ampliaGrad" x1="2" y1="46" x2="46" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset={0} stopColor="#b88cf2" />
          <stop offset={0.5} stopColor="#38c8d2" />
          <stop offset={1} stopColor="#36cf7d" />
        </linearGradient>
      </defs>
      <path d="M19.0761 0V18.3554L37.6526 10.4926L40 9.52785L17.5864 48V26.8126L0 36.3059L19.0761 0Z" fill="url(#ampliaGrad)" />
      <path d="M39.6304 26V33.6481L47.061 30.3719L48 29.9699L39.0345 46V37.1719L32 41.1275L39.6304 26Z" fill="url(#ampliaGrad)" />
    </svg>
  ),
};
