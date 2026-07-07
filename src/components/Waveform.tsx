/* ============================================================
   AMPLI — Waveform component (canvas)
   Draws stable bars, an orange progress fill, a playhead, and
   subtle live modulation from the analyser while playing.
   ============================================================ */
import { useRef, useEffect } from "react";
import type { AmpliAudio } from "../lib/audioEngine";

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

interface WaveformProps {
  player: AmpliAudio | null;
  bars: number[];
  height?: number;
  onScrub?: (frac: number) => void;
  compact?: boolean;
}

export function Waveform({ player, bars, height = 160, onScrub, compact = false }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      const r = wrapRef.current!.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapRef.current!);

    const draw = () => {
      const rootCS = getComputedStyle(document.documentElement);
      const tint = rootCS.getPropertyValue("--tint").trim() || "237,227,194";
      const orange = rootCS.getPropertyValue("--orange").trim() || "#e8602a";
      const creamFaint = `rgba(${tint},0.30)`;
      const orangeBright = orange;
      const n = bars.length;
      const gap = compact ? 1.5 : 2.5;
      const bw = (w - (n - 1) * gap) / n;
      if (w <= 0 || bw <= 0) { rafRef.current = requestAnimationFrame(draw); return; }
      const prog = player ? player.currentTime() / player.duration : 0;
      const levels = player && player.playing ? player.getLevels() : null;
      ctx.clearRect(0, 0, w, h);
      const mid = h / 2;
      for (let i = 0; i < n; i++) {
        const x = i * (bw + gap);
        let amp = bars[i];
        const played = (i / n) <= prog;
        if (levels && played) {
          const lv = levels[Math.floor((i / n) * levels.length)] / 255;
          amp = Math.min(1, amp * (0.75 + lv * 0.6));
        }
        const bh = Math.max(2, amp * (h * 0.86));
        ctx.fillStyle = played ? orange : creamFaint;
        if (played && Math.abs(i / n - prog) < 0.02) { ctx.fillStyle = orangeBright; }
        const rad = Math.max(0.5, Math.min(bw / 2, 2));
        roundRect(ctx, x, mid - bh / 2, bw, bh, rad);
        ctx.fill();
      }
      if (prog > 0) {
        const px = prog * w;
        ctx.fillStyle = orangeBright;
        ctx.fillRect(px - 0.75, 0, 1.5, h);
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [bars, player, compact]);

  const handle = (e: React.MouseEvent) => {
    if (!onScrub) return;
    const r = wrapRef.current!.getBoundingClientRect();
    const frac = (e.clientX - r.left) / r.width;
    onScrub(Math.max(0, Math.min(1, frac)));
  };

  return (
    <div ref={wrapRef} onClick={handle}
      style={{ width: "100%", height, cursor: onScrub ? "pointer" : "default", position: "relative" }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

interface MiniWaveProps {
  bars: number[];
  active?: boolean;
  theme?: string;
  color?: string;
  height?: number;
}

/* small static mini-waveform for cards */
export function MiniWave({ bars, active, theme, color, height = 26 }: MiniWaveProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = c.parentElement!.getBoundingClientRect();
    const w = r.width;
    c.width = w * dpr; c.height = height * dpr; c.style.width = w + "px"; c.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rootCS = getComputedStyle(document.documentElement);
    const tint = rootCS.getPropertyValue("--tint").trim() || "237,227,194";
    const orange = rootCS.getPropertyValue("--orange").trim() || "#e8602a";
    const fill = color || (active ? orange : `rgba(${tint},0.45)`);
    const n = bars.length;
    const gap = 1.5;
    const bw = (w - (n - 1) * gap) / n;
    const mid = height / 2;
    ctx.fillStyle = fill;
    for (let i = 0; i < n; i++) {
      const bh = Math.max(1.5, bars[i] * height * 0.8);
      roundRect(ctx, i * (bw + gap), mid - bh / 2, bw, bh, 1); ctx.fill();
    }
  }, [bars, active, theme, color, height]);
  return <div style={{ width: "100%", height }}><canvas ref={ref} /></div>;
}
