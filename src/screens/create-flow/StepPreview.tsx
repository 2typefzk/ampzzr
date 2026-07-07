/* ============================================================
   AMPLI — Etapa III: Prévia
   ============================================================ */
import { useState, useRef, useEffect, useMemo } from "react";
import { Icon, type IconRenderer } from "../../components/Icon";
import { Waveform } from "../../components/Waveform";
import { AmpliAudio, makeWaveBars } from "../../lib/audioEngine";
import { MODELS, VOICES } from "../../data/mockData";
import { getVars, estimateDurationForVariation, buildRoteiroForVariation, Modal } from "./StepStructure";
import type { ModelId, Trecho, Trilha } from "../../types";

export function fmt(t: number) {
  t = Math.max(0, t || 0);
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  return m + ":" + String(s).padStart(2, "0");
}

/* tiny real WAV so Download produces a genuine, playable file */
export function encodeWAV(durationSec: number, bars: number[]): Blob {
  const sr = 22050, n = Math.floor(sr * durationSec);
  const buf = new ArrayBuffer(44 + n * 2), view = new DataView(buf);
  const wr = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, "RIFF"); view.setUint32(4, 36 + n * 2, true); wr(8, "WAVE"); wr(12, "fmt ");
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sr, true); view.setUint32(28, sr * 2, true); view.setUint16(32, 2, true);
  view.setUint16(34, 16, true); wr(36, "data"); view.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const p = i / n;
    const env = bars[Math.floor(p * bars.length)] || 0.2;
    const carrier = Math.sin(2 * Math.PI * 210 * i / sr) * 0.5 + Math.sin(2 * Math.PI * 330 * i / sr) * 0.25;
    const v = carrier * env * 0.5 * Math.exp(-(p % 0.06) * 4);
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, v)) * 32767, true);
  }
  return new Blob([view], { type: "audio/wav" });
}

export interface StepPreviewProps {
  title: string;
  model: ModelId;
  trechos: Trecho[];
  trilha: Trilha | null;
  varLabels: string[];
  onBack: () => void;
  onClose: () => void;
  onFinish: () => void;
  onTrilhaUsed?: () => void;
}

export function StepPreview(props: StepPreviewProps) {
  const { title, model, trechos, trilha, varLabels, onBack, onClose, onTrilhaUsed } = props;

  const varCount = useMemo(() => {
    const vt = (trechos || []).filter((t) => t.tipo === "variavel");
    return vt.length ? Math.max.apply(null, vt.map((t) => getVars(t).length)) : 1;
  }, [trechos]);
  const [active, setActive] = useState(0);
  const varTitle = (i: number) => (varLabels && varLabels[i]) || ("Variação " + (i + 1));
  const segWords = (t: Trecho) => {
    const vs = getVars(t);
    const txt = t.tipo === "variavel" ? ((vs[active] != null ? vs[active] : vs[0]) || "") : (t.content || "");
    return txt.trim().split(/\s+/).filter(Boolean).length;
  };

  const durationSec = useMemo(() => {
    const [mm, ss] = estimateDurationForVariation(trechos, active).split(":").map(Number);
    return mm * 60 + ss;
  }, [trechos, active]);
  const bars = useMemo(() => makeWaveBars(90, (title?.length || 5) + trechos.length * 11 + active * 29), [active, title, trechos.length]);

  const playerRef = useRef<AmpliAudio | null>(null);
  const speedRef = useRef(1), bedRef = useRef(0.7);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [bedVol, setBedVol] = useState(0.7);
  const [regen, setRegen] = useState(false);
  const [dl, setDl] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [approved, setApproved] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const p = new AmpliAudio(durationSec);
    p.setSpeed(speedRef.current);
    p.setBedVolume(bedRef.current);
    playerRef.current = p;
    setCur(0); setPlaying(false);
    const off = p.on((t, pl) => { setCur(t); setPlaying(pl); });
    let raf: number;
    const loop = () => { setCur(p.currentTime()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); off(); p.destroy(); };
  }, [active, durationSec]);

  const m = MODELS[model];

  const changeSpeed = (v: number) => { setSpeed(v); speedRef.current = v; playerRef.current!.setSpeed(v); };
  const changeBed = (v: number) => { setBedVol(v); bedRef.current = v; playerRef.current!.setBedVolume(v); };

  const regenerate = () => {
    setRegen(true);
    playerRef.current!.pause();
    setTimeout(() => { setRegen(false); showToast("Áudio gerado novamente com os novos ajustes"); }, 1600);
  };

  const download = () => {
    setDl(true);
    setTimeout(() => {
      const blob = encodeWAV(durationSec, bars);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const suffix = varCount > 1 ? "_" + varTitle(active).replace(/[^\w\-]+/g, "_") : "";
      a.href = url; a.download = (title || "ampli-audio").replace(/[^\w\-]+/g, "_") + suffix + ".wav";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setDl(false); showToast("Download iniciado · arquivo .wav");
    }, 1100);
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const approve = () => {
    setApproved(true);
    setConfirm(false);
    if (trilha && onTrilhaUsed) onTrilhaUsed();
    showToast("Áudio e roteiro aprovados · salvos na biblioteca");
  };

  const copyRoteiro = () => {
    const txt = buildRoteiroForVariation(trechos, active);
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done).catch(done);
    } else { done(); }
    showToast("Roteiro copiado para a área de transferência");
  };

  return (
    <div className="sp-wrap">
      <header className="ss-header">
        <div className="ss-header-left">
          <button className="ss-model-btn static">
            <span className="mdot" style={{ background: m.color }}></span>{m.name}
          </button>
          <div className="ss-title" style={{ cursor: "default" }}>
            <span>{title || "Novo Áudio"}</span>
          </div>
        </div>
        <div className="ss-header-right">
          <button className="btn btn-ghost" onClick={onBack}>{Icon.chevLeft({ style: { width: 16, height: 16 } })} Voltar à estrutura</button>
          <button className="ss-close icon-btn" onClick={onClose}>{Icon.close()}</button>
        </div>
      </header>

      <div className="sp-pagehead">
        <div className="sp-pretitle">PRÉVIA DA ENTREGA</div>
        <h1 className="display sp-maintitle">Aprovar e Baixar</h1>
      </div>

      {varCount > 1 &&
        <div className="sp-tabs" role="tablist">
          {Array.from({ length: varCount }).map((_, i) =>
            <button key={i} role="tab" aria-selected={active === i}
              className={"sp-tab" + (active === i ? " active" : "")}
              onClick={() => setActive(i)}>
              <span className="sp-tab-num mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="sp-tab-lbl">{varTitle(i)}</span>
            </button>
          )}
        </div>
      }

      <div className="sp-body">
        <section className="sp-left">
          <div className="diag-bg"></div>
          <div className="sp-left-inner">
            <div className="sp-roteiro" style={{ alignItems: "stretch", justifyContent: "flex-start" }}>
              <div className="sp-roteiro-head">
                <div className="u-label">Roteiro gerado{varCount > 1 ? " · " + varTitle(active) : ""}</div>
                <button className={"ss-roteiro-copy icon-only" + (copied ? " ok" : "")} onClick={copyRoteiro}>
                  {copied ? Icon.check({ style: { width: 16, height: 16 } }) : Icon.copy({ style: { width: 16, height: 16 } })}
                  <span className="ss-tip">{copied ? "Copiado!" : "Copiar roteiro"}</span>
                </button>
              </div>
              <div className="ss-roteiro-panel" style={{ margin: "0px" }}>
                <pre className="ss-roteiro-text" style={{ whiteSpace: "pre-wrap" }}>{buildRoteiroForVariation(trechos, active)}</pre>
              </div>
            </div>

          </div>
        </section>

        <section className="sp-right">
          <div className="sp-right-inner">
            <div className="sp-group">
              <div className="sp-col-head"><div className="u-label">Áudio gerado{varCount > 1 ? " · " + varTitle(active) : ""}</div></div>

              <div className={"sp-player" + (regen ? " regen" : "")}>
                {regen &&
                  <div className="sp-regen-overlay anim-in">
                    <div className="sp-spinner"></div>
                    <span>Gerando novamente…</span>
                  </div>
                }
                <div className="sp-wave-card">
                  <Waveform player={playerRef.current} bars={bars} height={150} compact
                    onScrub={(f) => playerRef.current!.seek(f)} />
                </div>

                <div className="sp-controls">
                  <button className="sp-restart" onClick={() => playerRef.current!.seek(0)} title="Início">
                    {Icon.refresh({ style: { width: 18, height: 18 } })}
                  </button>
                  <button className="sp-playbtn" onClick={() => playerRef.current!.toggle()}>
                    {playing ? Icon.pause({ style: { width: 26, height: 26 } }) : Icon.play({ style: { width: 26, height: 26 } })}
                  </button>
                  <div className="sp-time">
                    <span className="mono sp-cur">{fmt(cur)}</span>
                    <span className="sp-time-sep mono">/</span>
                    <span className="mono sp-dur">{fmt(durationSec)}</span>
                  </div>
                  <span style={{ flex: 1 }}></span>
                  <span className="sp-voices">
                    {Icon.mic({ style: { width: 15, height: 15 } })}
                    {[...new Set(trechos.map((t) => VOICES.find((v) => v.id === (t.voice || "helena"))?.name))].join(" · ")}
                  </span>
                </div>
              </div>

              <div className="sp-segments">
                {trechos.map((t, i) =>
                  <div key={t.id} className="sp-seg" style={{ flex: Math.max(1, segWords(t)) }}>
                    <span className="sp-seg-num mono">{String(i + 1).padStart(2, "0")}</span>
                    <span className="sp-seg-label">{t.label}</span>
                  </div>
                )}
                {trilha &&
                  <div className="sp-seg trilha" style={{ flex: 0 }}>
                    <span className="sp-seg-label">{Icon.music({ style: { width: 13, height: 13 } })} {trilha.name}</span>
                  </div>
                }
              </div>
            </div>

            <div className="sp-group">
              <div className="u-label" style={{ marginBottom: 18 }}>Ajustar</div>

              <div className="sp-sliders">
                <Slider label="Velocidade" icon={Icon.speed} min={0.7} max={1.3} step={0.05}
                  value={speed} onChange={changeSpeed}
                  disabled={approved}
                  display={speed === 1 ? "Normal" : (speed < 1 ? "-" : "+") + Math.round(Math.abs(speed - 1) * 100) + "%"}
                  ticks={["Devagar", "Normal", "Rápido"]} />
                <Slider label="Volume da trilha" icon={Icon.volume} min={0} max={1} step={0.05}
                  value={bedVol} onChange={changeBed}
                  display={Math.round(bedVol * 100) + "%"}
                  disabled={!trilha || approved}
                  ticks={["Mudo", "", "Alto"]}
                  note={!trilha ? "Adicione uma trilha de fundo na etapa anterior" : undefined} />
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="sp-bar">
        <div className="sp-bar-row">
          <div className="sp-bar-left">
            <button className="btn btn-ghost btn-lg" onClick={regenerate} disabled={regen || approved}>
              {Icon.refresh()} Gerar novamente
            </button>
          </div>
          <div className="sp-bar-right">
            {approved ?
              <div className="sp-approved" aria-disabled="true">
                <span className="sp-check-box on">{Icon.check({ style: { width: 13, height: 13 } })}</span>
                Aprovado ✅
              </div> :

              <button className="sp-approve" onClick={() => setConfirm(true)}>
                <span className="sp-check-box"></span>
                Aprovar Roteiro e Áudio Gerado
              </button>
            }
            <button className={"btn btn-primary btn-lg sp-dlbtn" + (!approved || dl ? " is-disabled" : "")}
              onClick={() => { if (approved && !dl) download(); }}
              aria-disabled={!approved || dl}
              title={approved ? "Baixar áudio (.wav)" : "É necessário aprovar o conteúdo gerado para fazer o Download"}>
              {dl ? <span className="sp-spinner sm"></span> : Icon.download()}
              <span>Download</span>
            </button>
          </div>
        </div>
        {approved &&
          <div className="sp-saved">
            Alterações salvas! Seu novo áudio já está na biblioteca {Icon.check({ style: { width: 14, height: 14 } })}
          </div>
        }
      </div>

      {confirm &&
        <Modal onClose={() => setConfirm(false)} title="Aprovar áudio e roteiro?"
          sub="Ao aprovar, este áudio fica travado para edição. Para alterá-lo depois, você precisará duplicá-lo em uma nova edição.">
          <div className="sp-confirm-actions">
            <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={approve}>{Icon.check({ style: { width: 16, height: 16 } })} Aprovar</button>
          </div>
        </Modal>
      }

      {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}
    </div>);

}

/* custom slider */
export function Slider({ label, icon, min, max, step, value, onChange, display, disabled, ticks, note }: {
  label: string; icon?: IconRenderer; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; display: string; disabled?: boolean; ticks?: string[]; note?: string;
}) {
  const pct = (value - min) / (max - min) * 100;
  return (
    <div className={"sld" + (disabled ? " disabled" : "")}>
      <div className="sld-top">
        <span className="sld-label">{icon && icon({ style: { width: 16, height: 16 } })} {label}</span>
        <span className="sld-val mono">{display}</span>
      </div>
      <div className="sld-track-wrap">
        <input type="range" min={min} max={max} step={step} value={value} disabled={disabled}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="sld-input"
          style={{ ["--pct" as any]: pct + "%" }} />
      </div>
      {ticks && <div className="sld-ticks">{ticks.map((t, i) => <span key={i}>{t}</span>)}</div>}
      {note && <div className="sld-note">{note}</div>}
    </div>);

}
