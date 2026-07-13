/* ============================================================
   AMPLI — Dashboard (tela inicial)
   Hero com fundo animado espectral + Novo Áudio + Big Numbers
   + Últimos Projetos + Central de Ajuda
   ============================================================ */
import { useState, useEffect, useRef, useMemo } from "react";
import { Icon, type IconRenderer } from "../components/Icon";
import { MODELS, LIBRARY } from "../data/mockData";
import type { LibraryAudio } from "../types";

/* ---------- Spectral particle-field hero animation ---------- */
function HeroFx({ running }: { running: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const STOPS: [number, [number, number, number]][] = [
      [0.00, [54, 207, 125]],
      [0.26, [56, 200, 210]],
      [0.50, [74, 124, 240]],
      [0.74, [184, 140, 242]],
      [1.00, [232, 106, 208]],
    ];
    const sample = (p: number): [number, number, number] => {
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      for (let i = 1; i < STOPS.length; i++) {
        if (p <= STOPS[i][0]) {
          const a = STOPS[i - 1], b = STOPS[i];
          const f = (p - a[0]) / (b[0] - a[0]);
          return [
            Math.round(a[1][0] + (b[1][0] - a[1][0]) * f),
            Math.round(a[1][1] + (b[1][1] - a[1][1]) * f),
            Math.round(a[1][2] + (b[1][2] - a[1][2]) * f),
          ];
        }
      }
      return STOPS[STOPS.length - 1][1];
    };

    let COLS = 96, ROWS = 38, colColors: [number, number, number][] = [];
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      COLS = Math.max(48, Math.min(132, Math.floor(W / 11)));
      ROWS = Math.max(26, Math.min(46, Math.floor(H / 11)));
      colColors = [];
      for (let c = 0; c < COLS; c++) {
        const u = c / (COLS - 1);
        colColors.push(sample(u));
      }
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = (advance: boolean) => {
      if (advance) tRef.current += 0.0125;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";

      const cx = W * 0.5;
      const planeW = W * 0.92;
      const topY = H * 0.30;
      const planeH = H * 0.52;
      const amp = H * 0.17;

      for (let r = 0; r < ROWS; r++) {
        const v = r / (ROWS - 1);
        const persp = 0.42 + 0.58 * v;
        const baseY = topY + v * planeH;
        const rowW = planeW * persp;
        const size = 0.55 + 1.7 * v;
        const rowAlpha = 0.18 + 0.62 * v;
        for (let c = 0; c < COLS; c++) {
          const u = c / (COLS - 1);
          const h =
            Math.sin(u * 6.3 + t * 1.7) * 0.55 +
            Math.sin(u * 13.0 - v * 7.5 + t * 2.3) * 0.30 +
            Math.sin(v * 8.5 + t * 1.1 + u * 2.0) * 0.42 +
            Math.sin(u * 24.0 + v * 5.0 - t * 1.4) * 0.12;
          const hn = h / 1.39;

          const x = cx + (u - 0.5) * rowW;
          const y = baseY - hn * amp * persp;

          const edge = Math.sin(u * Math.PI);
          const peak = 0.4 + 0.6 * ((hn + 1) * 0.5);
          let a = rowAlpha * edge * peak;
          if (a <= 0.012) continue;
          if (a > 0.9) a = 0.9;

          const rgb = colColors[c];
          ctx.globalAlpha = a;
          ctx.fillStyle = "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
          ctx.beginPath();
          ctx.arc(x, y, size * (0.7 + 0.5 * peak), 0, 6.283);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    draw(false);
    if (reduce || !running) {
      return () => { ro.disconnect(); };
    }

    const loop = () => {
      if (!document.hidden) draw(true);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [running]);

  return <canvas ref={ref} className="dash-hero-canvas"></canvas>;
}

/* ---------- big numbers ---------- */
function BigNumber({ label, value, icon, foot, trend, delay }: {
  label: string; value: number; icon: IconRenderer; foot: string; trend?: number; delay?: number;
}) {
  return (
    <div className="bn-card anim-up" style={{ animationDelay: (delay || 0) + "s" }}>
      <div className="bn-top">
        <span className="bn-label">{label}</span>
        <span className="bn-ic">{icon({ style: { width: 19, height: 19 } })}</span>
      </div>
      <div className="bn-value">{value.toLocaleString("pt-BR")}</div>
      <div className="bn-foot">
        {trend != null &&
          <span className="bn-trend">{Icon.arrowUp()} {trend}%</span>
        }
        <span>{foot}</span>
      </div>
    </div>
  );
}

function BigNumberSplit({ label, icon, rows, delay }: {
  label: string; icon: IconRenderer;
  rows: { name: string; value: number; color: string }[]; delay?: number;
}) {
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="bn-card anim-up" style={{ animationDelay: (delay || 0) + "s" }}>
      <div className="bn-top">
        <span className="bn-label">{label}</span>
        <span className="bn-ic">{icon({ style: { width: 19, height: 19 } })}</span>
      </div>
      <div className="bn-split">
        {rows.map((r) => (
          <div key={r.name}>
            <div className="bn-split-row">
              <span className="bn-split-dot" style={{ background: r.color }}></span>
              <span className="bn-split-name">{r.name}</span>
              <span className="bn-split-val">{r.value}</span>
            </div>
            <div className="bn-bar">
              <div className="bn-bar-fill" style={{ width: Math.round(r.value / total * 100) + "%", background: r.color }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Áudio em Lote: stateful drop area (roteiro + planilha) ---------- */
function BatchDrop({ onComplete, gridArea }: { onComplete?: () => void; gridArea?: string }) {
  const [drag, setDrag] = useState(false);
  const [roteiro, setRoteiro] = useState<string | false>(false);
  const [planilha, setPlanilha] = useState<string | false>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const done = !!(roteiro && planilha);

  const classify = (name: string): "rot" | "pla" | null => {
    const ext = (name.split(".").pop() || "").toLowerCase();
    if (["doc", "docx", "txt"].includes(ext)) return "rot";
    if (["xls", "xlsx", "csv"].includes(ext)) return "pla";
    return null;
  };

  const ingest = (files: FileList | null | undefined) => {
    let nr = roteiro, np = planilha;
    const list = Array.from(files || []);
    list.forEach((f) => {
      const k = classify(f.name);
      if (k === "rot" && !nr) nr = f.name;
      else if (k === "pla" && !np) np = f.name;
      else if (!k) { if (!nr) nr = f.name; else if (!np) np = f.name; }
    });
    if (!list.length) { if (!nr) nr = "roteiro.docx"; else if (!np) np = "variaveis.xlsx"; }
    setRoteiro(nr); setPlanilha(np);
    if (nr && np) setTimeout(() => onComplete && onComplete(), 540);
  };

  const openPicker = () => { if (!done && inputRef.current) inputRef.current.click(); };
  const onDropBatch = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); ingest(e.dataTransfer && e.dataTransfer.files); };

  const eyebrow = done ? "Roteiro e planilha" :
    roteiro ? "Importar planilha" :
      planilha ? "Importar roteiro" :
        "Importar roteiro e planilha";

  return (
    <div
      className={"na-surface na-drop na-batch" + (drag ? " dragover" : "") + (done ? " is-done" : "")}
      style={gridArea ? { gridArea } : undefined}
      onClick={openPicker}
      onDragOver={(e) => { if (!done) { e.preventDefault(); setDrag(true); } }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDropBatch}
      role="button">

      <span className="na-surface-eyebrow">{eyebrow}</span>
      <div className="na-drop-center">
        <div className="na-tiles">
          {roteiro &&
            <span className="na-file-tile" title={typeof roteiro === "string" ? roteiro : ""}>
              {Icon.doc({ style: { width: 26, height: 26 } })}
              <span className="na-file-badge">{Icon.check({ style: { width: 12, height: 12 } })}</span>
            </span>
          }
          {planilha &&
            <span className="na-file-tile" title={typeof planilha === "string" ? planilha : ""}>
              {Icon.table({ style: { width: 26, height: 26 } })}
              <span className="na-file-badge">{Icon.check({ style: { width: 12, height: 12 } })}</span>
            </span>
          }
          {!done &&
            <span className="na-up-tile">{Icon.upload({ style: { width: 24, height: 24 } })}</span>
          }
        </div>
        {!done &&
          <>
            <span className="na-drop-cta" style={{ lineHeight: "1.05" }}><u>Arraste até aqui</u> ou selecione</span>
            <span className="na-drop-hint" style={{ lineHeight: "0.95" }}>{
              roteiro ? "XLS ou CSV" :
                planilha ? "DOC ou TXT" :
                  <>DOC ou TXT <span className="na-hint-plus">+</span> XLS ou CSV</>
            }</span>
          </>
        }
      </div>
      <input ref={inputRef} type="file" hidden multiple accept=".doc,.docx,.txt,.xls,.xlsx,.csv" onChange={(e) => ingest(e.target.files)} />
    </div>
  );
}

/* ---------- Novo Áudio selection ---------- */
function NovoAudio({ onScratch, onImportFile, onPaste, onBatch }: {
  onScratch: () => void; onImportFile: () => void; onPaste: (txt: string) => void; onBatch: () => void;
}) {
  const [drag, setDrag] = useState(false);
  const [txt, setTxt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const onDropRoteiro = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    onImportFile && onImportFile();
  };

  return (
    <div className="novo-audio anim-up" style={{ animationDelay: ".06s" }}>
      <div className="na-head">
        <p className="na-sub"><strong>Bora produzir?</strong> Escolha como quer começar:</p>
        <button className="btn btn-primary btn-lg na-scratch" onClick={onScratch}>
          {Icon.plus()} Começar do zero
        </button>
      </div>

      <div className="na-divider"></div>

      <div className="na-row">
        <div className="na-col-head" style={{ gridArea: "h1" }}>
          <span className="na-col-ic">{Icon.waveform({ style: { width: 21, height: 21 } })}</span>
          <div>
            <h3 className="na-col-title">Novo Áudio</h3>
            <p className="na-col-sub">Começar a partir de um Roteiro</p>
          </div>
        </div>
        <div className="na-col-head" style={{ gridArea: "h2" }}>
          <span className="na-col-ic">{Icon.layers({ style: { width: 21, height: 21 } })}</span>
          <div>
            <h3 className="na-col-title">Áudio em Lote</h3>
            <p className="na-col-sub">Começar a partir de um Roteiro e Planilha com variáveis</p>
          </div>
        </div>

        <div
          className={"na-surface na-drop" + (drag ? " dragover" : "")}
          style={{ gridArea: "d1" }}
          onClick={() => onImportFile && onImportFile()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDropRoteiro}
          role="button">

          <span className="na-surface-eyebrow">Importar roteiro</span>
          <div className="na-drop-center">
            <span className="na-drop-ic">{Icon.upload({ style: { width: 24, height: 24 } })}</span>
            <span className="na-drop-cta" style={{ lineHeight: "1.05" }}><u>Arraste até aqui</u> ou selecione</span>
            <span className="na-drop-hint" style={{ lineHeight: "0.95" }}>DOC ou TXT</span>
          </div>
          <input ref={fileRef} type="file" hidden accept=".doc,.docx,.txt" onChange={() => onImportFile && onImportFile()} />
        </div>

        <div className="na-or">OU</div>

        <BatchDrop gridArea="d2" onComplete={() => onBatch && onBatch()} />
      </div>

      <div className="na-surface na-paste" hidden>
        <div className="na-paste-head">
          <span className="na-surface-eyebrow">COLAR UM ROTEIRO</span>
          <span className="na-paste-count mono">{txt.length} car.</span>
        </div>
        <textarea
          className="na-textarea"
          placeholder={"Já tem um rascunho do roteiro? Boa! É só colar aqui e clicar em “Avançar”, que nossa IA vai formatá-lo para você!"}
          value={txt}
          onChange={(e) => setTxt(e.target.value)} />

        <button
          className="btn btn-primary na-paste-btn"
          disabled={!txt.trim()}
          onClick={() => onPaste && onPaste(txt)}>

          Avançar {Icon.arrowRight()}
        </button>
      </div>
    </div>
  );
}

/* ---------- Últimos Projetos list ---------- */
function RecentProjects({ items, onOpen, onSeeAll }: {
  items: LibraryAudio[]; onOpen: (a: LibraryAudio) => void; onSeeAll: () => void;
}) {
  return (
    <section className="dash-recent">
      <div className="dash-sec-head">
        <h2 className="dash-sec-title">Últimos Projetos</h2>
        <button className="dash-sec-link" onClick={onSeeAll}>
          Ver todos {Icon.arrowRight()}
        </button>
      </div>
      <div className="dp-list">
        {items.map((a) => {
          const m = MODELS[a.model] || MODELS.spot;
          return (
            <button key={a.id} className="dp-item" onClick={() => onOpen && onOpen(a)}>
              <span className="dp-play">{Icon.play()}</span>
              <span className="dp-main">
                <span className="dp-name">{a.name}</span>
                <span className="dp-meta">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="mdot" style={{ background: m.color }}></span>{m.name}
                  </span>
                  <span className="dp-dot">·</span>
                  <span className="mono">{a.dur}</span>
                  <span className="dp-dot">·</span>
                  <span>{a.voice}</span>
                </span>
              </span>
              <span className="dp-right">
                {a.status === "rascunho" && <span className="dp-draft">Rascunho</span>}
                <span className="dp-date">{a.date}</span>
                <span className="dp-arrow">{Icon.chevRight({ style: { width: 18, height: 18 } })}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Central de Ajuda ---------- */
function HelpBanner({ onDocs, onSupport }: { onDocs: () => void; onSupport: () => void }) {
  return (
    <aside className="help-banner anim-up" style={{ animationDelay: ".05s" }}>
      <span className="help-ic">{Icon.help({ style: { width: 24, height: 24 } })}</span>
      <h2 className="help-title">Central de Ajuda</h2>
      <p className="help-text">Dúvidas sobre modelos, vozes ou trilhas? Encontre tudo na documentação ou fale com nosso time.</p>
      <div className="help-links">
        <button className="help-link" onClick={onDocs}>
          <span className="help-link-ic">{Icon.doc({ style: { width: 17, height: 17 } })}</span>
          <span className="help-link-body">
            <span className="help-link-name">Documentação</span>
            <span className="help-link-sub">Guias, modelos e boas práticas</span>
          </span>
          <span className="help-link-go">{Icon.arrowRight({ style: { width: 17, height: 17 } })}</span>
        </button>
        <button className="help-link" onClick={onSupport}>
          <span className="help-link-ic">{Icon.chat({ style: { width: 17, height: 17 } })}</span>
          <span className="help-link-body">
            <span className="help-link-name">Chamados</span>
            <span className="help-link-sub">Abrir um chamado para a equipe Fuzzr</span>
          </span>
          <span className="help-link-go">{Icon.arrowRight({ style: { width: 17, height: 17 } })}</span>
        </button>
      </div>
    </aside>
  );
}

export interface DashboardProps {
  userName: string;
  onNew: () => void;
  onStartRoteiro: (text: string | null, kind: string) => void;
  onStartBatch: () => void;
  onOpen: (a: LibraryAudio) => void;
  onNavigate: (route: string) => void;
  onOpenChamado?: () => void;
  heroAnim: boolean;
}

/* ---------- Dashboard page ---------- */
export function Dashboard({ userName, onNew, onStartRoteiro, onStartBatch, onOpen, onNavigate, onOpenChamado, heroAnim }: DashboardProps) {
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const recent = useMemo(() => [...LIBRARY].sort((a, b) => b.ts - a.ts).slice(0, 6), []);

  return (
    <div className="dash-page">
      <div className="dash-hero">
        <HeroFx running={heroAnim !== false} />
        <div className="hero-inner">
          <div className="hero-eyebrow">Dashboard</div>
          <h1 className="display hero-title">Olá, {userName} <span className="hero-bolt">⚡️</span></h1>

          <NovoAudio
            onScratch={onNew}
            onImportFile={() => onStartRoteiro && onStartRoteiro(null, "file")}
            onBatch={() => onStartBatch && onStartBatch()}
            onPaste={(txt) => onStartRoteiro && onStartRoteiro(txt, "paste")} />

        </div>
      </div>

      <div className="dash-body">
        <div className="bn-grid">
          <BigNumber label="Áudios Gerados" value={142} icon={Icon.chart} foot="no total" trend={18} delay={0} />
          <BigNumberSplit label="Modelos" icon={Icon.waveform} delay={0.05}
            rows={[
              { name: "Spot", value: 98, color: MODELS.spot.color },
              { name: "Carro de Som", value: 44, color: MODELS.carro.color },
            ]} />
          <BigNumber label="Aprovações" value={87} icon={Icon.thumbsUp} foot="roteiros aprovados" trend={9} delay={0.1} />
          <BigNumber label="Chamados" value={12} icon={Icon.chat} foot="de apoio em aberto" delay={0.15} />
        </div>

        <div className="dash-cols">
          <RecentProjects items={recent} onOpen={onOpen} onSeeAll={() => onNavigate && onNavigate("audios")} />
          <HelpBanner
            onDocs={() => flash("Abrindo a documentação…")}
            onSupport={() => onOpenChamado ? onOpenChamado() : flash("Pedido de apoio enviado — nossa equipe vai te responder")} />

        </div>
      </div>

      {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}
    </div>
  );
}
