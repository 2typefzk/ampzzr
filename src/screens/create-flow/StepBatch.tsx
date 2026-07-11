/* ============================================================
   AMPLI — Edição em Lote (datatable de variações)
   Cada linha = uma variação do mesmo Áudio.
   ============================================================ */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Icon } from "../../components/Icon";
import { Waveform } from "../../components/Waveform";
import { AmpliAudio, makeWaveBars } from "../../lib/audioEngine";
import { MODELS, VOICES, TRILHA_LIB } from "../../data/mockData";
import { estimateDurationForVariation, buildRoteiroForVariation } from "./StepStructure";
import { encodeWAV, fmt } from "./StepPreview";
import type { BatchRow, HelpTarget, ModelId, Trecho, TrechoTipo, Trilha } from "../../types";

/* ---- Rainbow por linha (ordem do arco-íris, cor de fundo a 75%) ---- */
function _hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255)) as [number, number, number];
}
function _lum([r, g, b]: [number, number, number]) {
  const a = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
const RAINBOW = (() => {
  const out: { bg: string; text: string; soft: string }[] = [];
  for (let i = 0; i < 13; i++) {
    const h = 12 + i * 28;
    const rgb = _hslToRgb(h, 0.82, 0.56);
    const comp = rgb.map((c) => Math.round(c * 0.75 + 22 * 0.25)) as [number, number, number];
    out.push({
      bg: `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.75)`,
      text: _lum(comp) > 0.45 ? "#1d1507" : "#f6f2e7",
      soft: _lum(comp) > 0.45 ? "rgba(20,14,4,0.62)" : "rgba(246,242,231,0.72)"
    });
  }
  return out;
})();
const rowColor = (i: number) => RAINBOW[i % RAINBOW.length];

/* bold the opening clause up to the first "!" or ":" (e.g. "Alô Sorocaba!") */
function leadSplit(text: string): [string, string] {
  const t = (text || "").trimStart();
  const m = t.match(/^[^!:]{1,42}[!:]/);
  if (m) return [m[0], t.slice(m[0].length)];
  return ["", t];
}

const TIPO_BADGE: Record<TrechoTipo, string> = { texto: "TXT", audio: "AUD", variavel: "VAR" };
const STATUS_LABEL: Record<BatchRow["status"], string> = { pronto: "Pronto", aprovado: "Aprovado", modificado: "Modificado" };

function varText(t: Trecho, r: number) {
  if (t.tipo === "variavel") return (t.variacoes && t.variacoes[r] != null ? t.variacoes[r] : "") || "";
  return t.content || "";
}
function durSecFor(trechos: Trecho[], r: number) {
  const [mm, ss] = estimateDurationForVariation(trechos, r).split(":").map(Number);
  return mm * 60 + ss;
}

/* ---- demo seed: Casas Bahia · Semana do Cliente ---- */
export function mkBatchDemo(): { rows: BatchRow[]; trechos: Trecho[]; title: string; model: ModelId; trilha?: Trilha | null } {
  const rows: BatchRow[] = [
    { id: "v1", name: "SemanaCliente_Sorocaba", status: "aprovado" },
    { id: "v2", name: "SemanaCliente_Itapetininga", status: "pronto" },
    { id: "v3", name: "SemanaCliente_SMA", status: "modificado" }];

  const trechos: Trecho[] = [
    {
      id: "b1", label: "Cabeça", tipo: "variavel", variacoes: [
        "Alô Sorocaba! Chegou a Semana do Cliente nas Casas Bahia! São milhares de ofertas pra deixar a sua casa com a sua cara.",
        "Alô Itapetininga! Chegou a Semana do Cliente nas Casas Bahia! São milhares de ofertas pra deixar a sua casa com a sua cara.",
        "Alô São Miguel Arcanjo! Chegou a Semana do Cliente nas Casas Bahia! São milhares de ofertas pra deixar a sua casa."]
    },
    {
      id: "b2", label: "Oferta", tipo: "texto",
      content: "Sofá retrátil em até dez vezes de noventa e nove reais. Guarda-roupa de casal com quarenta por cento de desconto. E o colchão king a partir de cento e noventa e nove à vista!"
    },
    {
      id: "b3", label: "Trilha", tipo: "audio",
      audio: { id: "aud-fixo", name: "trilha_semana_cliente.wav", durSec: 14 }
    },
    {
      id: "b4", label: "Fechamento", tipo: "variavel", variacoes: [
        "Em Sorocaba na Rua Doutor Álvaro Soares, 99. Casas Bahia, Dedicação total a você!",
        "Em Itapetininga na Rua Campos Salles, 1080. Dedicação total a você!",
        "Em São Miguel na Praça da Basílica. Dedicação total a você!"]
    }];

  return { rows, trechos, title: "SemanaCliente_CasasBahia", model: "spot" };
}

/* ===== status pill ===== */
function StatusDot({ status }: { status: BatchRow["status"] }) {
  return <span className={"be-stdot be-stdot-" + status}></span>;
}
function StatusPill({ status }: { status: BatchRow["status"] }) {
  if (status === "aprovado")
    return <span className="be-st be-st-ok">{Icon.check({ style: { width: 12, height: 12 } })} Aprovado</span>;
  if (status === "modificado")
    return <span className="be-st be-st-mod">Modificado</span>;
  return <span className="be-st be-st-pronto">Pronto</span>;
}

/* ===== editable status (dropdown) ===== */
function StatusSelect({ status, onChange }: { status: BatchRow["status"]; onChange: (s: BatchRow["status"]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="be-stsel">
      <button className={"be-stsel-btn" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        <StatusPill status={status} />
        {Icon.chevDown({ style: { width: 15, height: 15 } })}
      </button>
      {open &&
        <>
          <div className="be-menu-scrim" onClick={() => setOpen(false)}></div>
          <div className="be-menu right anim-up">
            <div className="be-menu-grp">Status do áudio</div>
            {(["pronto", "aprovado", "modificado"] as const).map((v) =>
              <button key={v} className={"be-menu-item" + (status === v ? " active" : "")}
                onClick={() => { onChange(v); setOpen(false); }}>
                <StatusDot status={v} /> {STATUS_LABEL[v]}
                {status === v && <span className="be-menu-ck">{Icon.check({ style: { width: 15, height: 15 } })}</span>}
              </button>
            )}
          </div>
        </>}
    </div>);
}

/* ===== audio player hook ===== */
function useClip(durationSec: number) {
  const playerRef = useRef<AmpliAudio | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const p = new AmpliAudio(durationSec);
    playerRef.current = p;
    const off = p.on((t, pl) => { setCur(t); setPlaying(pl); });
    let raf: number;
    const loop = () => { setCur(p.currentTime()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); off(); p.destroy(); };
  }, [durationSec]);
  return { playerRef, playing, cur };
}

/* compact clip player */
function ClipPlayer({ name, durationSec, seed, onDelete }: {
  name: string; durationSec: number; seed?: number; onDelete?: () => void;
}) {
  const bars = useMemo(() => makeWaveBars(46, (seed || 7) * 13 + name.length), [seed, name]);
  const { playerRef, playing, cur } = useClip(durationSec);
  return (
    <div className="be-clip">
      <div className="be-clip-top">
        <span className="be-clip-name mono">{Icon.music({ style: { width: 14, height: 14 } })} {name}</span>
        <span className="be-clip-right">
          <span className="mono be-clip-dur">{fmt(durationSec)}</span>
          {onDelete && <button className="be-clip-del" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Remover áudio">{Icon.trash({ style: { width: 15, height: 15 } })}</button>}
        </span>
      </div>
      <div className="be-clip-row">
        <button className="be-clip-play" onClick={(e) => { e.stopPropagation(); playerRef.current!.toggle(); }}>
          {playing ? Icon.pause({ style: { width: 18, height: 18 } }) : Icon.play({ style: { width: 18, height: 18 } })}
        </button>
        <div className="be-clip-wave" onClick={(e) => e.stopPropagation()}>
          <Waveform player={playerRef.current} bars={bars} height={44} compact onScrub={(f) => playerRef.current!.seek(f)} />
        </div>
        <span className="mono be-clip-cur">{fmt(cur)}</span>
      </div>
    </div>);
}

/* full audio panel */
function AudioPanel({ durationSec, seed, voice }: { durationSec: number; seed?: number; voice?: string }) {
  const bars = useMemo(() => makeWaveBars(90, (seed || 5) * 29 + 11), [seed]);
  const { playerRef, playing, cur } = useClip(durationSec);
  return (
    <div className="sp-player">
      <div className="sp-wave-card">
        <Waveform player={playerRef.current} bars={bars} height={150} compact onScrub={(f) => playerRef.current!.seek(f)} />
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
        <span className="sp-voices">{Icon.mic({ style: { width: 15, height: 15 } })} {voice || "Helena"}</span>
      </div>
    </div>);
}

/* ===== Modal "Trecho" — edita o conteúdo de um trecho ===== */
function TrechoModal({ trecho, rowIndex, rowName, onClose, onSave, onSetAudio }: {
  trecho: Trecho; rowIndex: number; rowName: string; onClose: () => void; onSave: (v: string) => void; onSetAudio?: (a: null) => void;
}) {
  const isVar = trecho.tipo === "variavel";
  const [val, setVal] = useState(isVar ? varText(trecho, rowIndex) : (trecho.content || ""));
  const title = trecho.label + (isVar ? " · " + rowName : "");
  const sub = isVar ? "Conteúdo desta variação — exclusivo deste áudio" :
    trecho.tipo === "audio" ? "Áudio fixo — compartilhado por todas as variações" :
      "Texto fixo — compartilhado por todas as variações";

  return (
    <div className="md-scrim anim-in" onClick={onClose}>
      <div className="md-box wide anim-up" onClick={(e) => e.stopPropagation()}>
        <div className="md-head">
          <div>
            <h3 className="md-title">{title}</h3>
            <p className="md-sub">{sub}</p>
          </div>
          <span className="be-trecho-type">{TIPO_BADGE[trecho.tipo || "texto"]}</span>
          <button className="icon-btn" onClick={onClose}>{Icon.close()}</button>
        </div>
        <div className="md-body">
          {trecho.tipo === "audio" ?
            <div className="be-trecho-audio">
              <ClipPlayer name={(trecho.audio && trecho.audio.name) || "gravacao_fixa.wav"} durationSec={14}
                seed={(trecho.id.charCodeAt(1) || 7)} onDelete={onSetAudio ? () => onSetAudio(null) : undefined} />
            </div> :
            <>
              <div className="ss-textarea-wrap">
                <textarea className="ss-textarea" style={{ minHeight: 180 }} autoFocus
                  placeholder={"Digite ou cole o roteiro do trecho “" + trecho.label + "” aqui…"}
                  value={val} onChange={(e) => setVal(e.target.value)} />
              </div>
              <div className="ss-textarea-foot" style={{ marginTop: 8 }}>
                <span className="ss-hint">{Icon.sparkle({ style: { width: 14, height: 14 } })} {isVar ? "Cada variação gera uma prévia diferente" : "Alterar afeta todas as variações"}</span>
                <span className="ss-count mono">{val.length} car.</span>
              </div>
            </>}
          <div className="be-modal-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            {trecho.tipo !== "audio" &&
              <button className="btn btn-primary" onClick={() => onSave(val)}>{Icon.check({ style: { width: 16, height: 16 } })} Salvar trecho</button>}
          </div>
        </div>
      </div>
    </div>);
}

/* ===== Modal "Detalhes do Áudio (Variação)" ===== */
function DetalhesModal({ row, rowIndex, trechos, onClose, onRename, onStatus, onDownload, onCopyToast }: {
  row: BatchRow; rowIndex: number; trechos: Trecho[]; onClose: () => void; onRename: (n: string) => void;
  onStatus: (s: BatchRow["status"]) => void; onDownload: () => void; onCopyToast?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const roteiro = useMemo(() => buildRoteiroForVariation(trechos, rowIndex), [trechos, rowIndex]);
  const dur = useMemo(() => durSecFor(trechos, rowIndex), [trechos, rowIndex]);
  const voice = useMemo(() => {
    const names = [...new Set(trechos.map((t) => (VOICES.find((v) => v.id === (t.voice || "helena")) || {}).name))];
    return names.filter(Boolean).join(" · ") || "Helena";
  }, [trechos]);

  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(roteiro).then(done).catch(done);
    else done();
    onCopyToast && onCopyToast();
  };

  return (
    <div className="md-scrim anim-in" onClick={onClose}>
      <div className="be-detail anim-up" onClick={(e) => e.stopPropagation()}>
        <header className="be-dt-head">
          <div className="be-dt-titlewrap">
            <span className="be-dt-eyebrow">Detalhes do áudio · Variação {String(rowIndex + 1).padStart(2, "0")}</span>
            <input className="be-dt-title mono" value={row.name}
              onChange={(e) => onRename(e.target.value)} spellCheck={false} />
          </div>
          <div className="be-dt-head-right">
            <StatusSelect status={row.status} onChange={onStatus} />
            <button className="icon-btn" onClick={onClose}>{Icon.close()}</button>
          </div>
        </header>

        <div className="be-dt-body">
          <section className="be-dt-roteiro">
            <div className="sp-roteiro-head">
              <div className="u-label">Roteiro gerado</div>
              <button className={"ss-roteiro-copy icon-only" + (copied ? " ok" : "")} onClick={copy}>
                {copied ? Icon.check({ style: { width: 16, height: 16 } }) : Icon.copy({ style: { width: 16, height: 16 } })}
              </button>
            </div>
            <div className="ss-roteiro-panel">
              <pre className="ss-roteiro-text" style={{ whiteSpace: "pre-wrap" }}>{roteiro}</pre>
            </div>
          </section>

          <section className="be-dt-audio">
            <div className="u-label" style={{ marginBottom: 12 }}>Áudio gerado</div>
            <AudioPanel durationSec={dur} seed={rowIndex + 2} voice={voice} />
          </section>
        </div>

        <footer className="be-dt-foot">
          <button className="btn btn-ghost btn-lg" onClick={onClose}>Fechar</button>
          <button className={"btn btn-primary btn-lg" + (row.status === "aprovado" ? "" : " is-disabled")}
            aria-disabled={row.status !== "aprovado"}
            title={row.status === "aprovado" ? "Baixar áudio (.wav)" : "Disponível após aprovação"}
            onClick={() => { if (row.status === "aprovado") onDownload(); }}>
            {Icon.download({ style: { width: 16, height: 16 } })} Download
          </button>
        </footer>
      </div>
    </div>);
}

/* ===== trecho column header (rename + type/menu) ===== */
function TrechoHeader({ trecho, index, count, onRename, onSetTipo, onMove, onDelete }: {
  trecho: Trecho; index: number; count: number; onRename: (v: string) => void; onSetTipo: (tp: TrechoTipo) => void;
  onMove: (d: number) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);
  return (
    <div className="be-thead">
      <span className="be-thead-grip" title="Arraste para reordenar">{Icon.drag({ style: { width: 15, height: 15 } })}</span>
      <span className="be-thead-num mono">{index + 1}.</span>
      {editing ?
        <input autoFocus className="be-thead-input"
          value={trecho.label}
          onChange={(e) => onRename(e.target.value)}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === "Enter") setEditing(false); }} /> :
        <button className="be-thead-label" onClick={() => setEditing(true)} title="Renomear trecho">
          <span className="be-thead-txt">{trecho.label}</span>
          {Icon.pencil({ style: { width: 13, height: 13 } })}
        </button>}
      <button className={"be-thead-type" + (menu ? " open" : "")} onClick={() => setMenu((o) => !o)}>
        {TIPO_BADGE[trecho.tipo || "texto"]} {Icon.chevDown({ style: { width: 14, height: 14 } })}
      </button>
      {menu &&
        <>
          <div className="be-menu-scrim" onClick={() => setMenu(false)}></div>
          <div className="be-menu anim-up">
            <div className="be-menu-grp">Tipo de conteúdo</div>
            {(["texto", "audio", "variavel"] as const).map((tp) =>
              <button key={tp} className={"be-menu-item" + (trecho.tipo === tp ? " active" : "")}
                onClick={() => { onSetTipo(tp); setMenu(false); }}>
                <span className="be-menu-tag">{TIPO_BADGE[tp]}</span>
                {tp === "texto" ? "Texto" : tp === "audio" ? "Áudio" : "Variável"}
                {trecho.tipo === tp && <span className="be-menu-ck">{Icon.check({ style: { width: 15, height: 15 } })}</span>}
              </button>
            )}
            <div className="be-menu-div"></div>
            <button className="be-menu-item" disabled={index === 0} onClick={() => { onMove(-1); setMenu(false); }}>
              {Icon.chevLeft({ style: { width: 15, height: 15 } })} Mover para esquerda
            </button>
            <button className="be-menu-item" disabled={index === count - 1} onClick={() => { onMove(1); setMenu(false); }}>
              {Icon.chevRight({ style: { width: 15, height: 15 } })} Mover para direita
            </button>
            <button className="be-menu-item danger" disabled={count <= 1} onClick={() => { onDelete(); setMenu(false); }}>
              {Icon.trash({ style: { width: 15, height: 15 } })} Excluir trecho
            </button>
          </div>
        </>}
    </div>);
}

/* ===== row action cluster ===== */
function RowActions({ row, menuOpen, onPlay, onRegen, onDownload, onMenu, onDetails, onApprove, onDuplicate, onDelete, canDelete }: {
  row: BatchRow; menuOpen: boolean; onPlay: () => void; onRegen: () => void; onDownload: () => void; onMenu: () => void;
  onDetails: () => void; onApprove: () => void; onDuplicate: () => void; onDelete: () => void; canDelete: boolean;
}) {
  const isMod = row.status === "modificado";
  const canDownload = row.status === "aprovado";
  return (
    <div className="be-acts">
      {isMod ?
        <button className="be-act regen" onClick={onRegen} title="Regerar áudio">{Icon.refresh({ style: { width: 16, height: 16 } })}</button> :
        <button className="be-act play" onClick={onPlay} title="Reproduzir">{Icon.play({ style: { width: 15, height: 15 } })}</button>}
      <button className={"be-act" + (canDownload ? "" : " disabled")} disabled={!canDownload} onClick={onDownload} title={canDownload ? "Baixar (.wav)" : "Disponível após aprovação"}>
        {Icon.download({ style: { width: 15, height: 15 } })}
      </button>
      <button className={"be-act" + (menuOpen ? " open" : "")} onClick={onMenu} title="Mais ações">{Icon.menu({ style: { width: 16, height: 16 } })}</button>
      {menuOpen &&
        <>
          <div className="be-menu-scrim" onClick={onMenu}></div>
          <div className="be-menu right anim-up">
            <button className="be-menu-item" onClick={onDetails}>{Icon.pencil({ style: { width: 15, height: 15 } })} Editar detalhes</button>
            {row.status === "pronto" &&
              <button className="be-menu-item" onClick={onApprove}>{Icon.check({ style: { width: 15, height: 15 } })} Aprovar</button>}
            {row.status === "modificado" &&
              <button className="be-menu-item" onClick={onRegen}>{Icon.refresh({ style: { width: 15, height: 15 } })} Regerar</button>}
            <div className="be-menu-div"></div>
            <button className="be-menu-item" onClick={onDuplicate}>{Icon.copy({ style: { width: 15, height: 15 } })} Duplicar</button>
            <button className="be-menu-item danger" disabled={!canDelete} onClick={onDelete}>{Icon.trash({ style: { width: 15, height: 15 } })} Excluir variação</button>
          </div>
        </>}
    </div>);
}

/* ===== main screen ===== */
export function BatchEdit({ onClose, onComplete, onRequestHelp, seed }: {
  onClose: () => void; onComplete: () => void; onRequestHelp?: (target: HelpTarget) => void;
  seed?: { rows: BatchRow[]; trechos: Trecho[]; title: string; model: ModelId; trilha?: Trilha | null };
}) {
  const init = seed || mkBatchDemo();
  const m = MODELS[init.model] || MODELS.spot;
  const [loteTitle, setLoteTitle] = useState(init.title || "Novo Lote");
  const [editingTitle, setEditingTitle] = useState(false);
  const [batchMenu, setBatchMenu] = useState(false);
  const [rows, setRows] = useState<BatchRow[]>(init.rows);
  const [trechos, setTrechos] = useState<Trecho[]>(init.trechos);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [trechoModal, setTrechoModal] = useState<{ ti: number; r: number } | null>(null);
  const [detailRow, setDetailRow] = useState<number | null>(null);
  const [confirm, setConfirm] = useState<{ kind: "approve" | "delete"; r: number } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [trilha, setTrilha] = useState<Trilha | null>(init.trilha || null);
  const [trilhaOpen, setTrilhaOpen] = useState(false);
  const [dragVar, setDragVar] = useState<{ ti: number; r: number } | null>(null);
  const [dragCol, setDragCol] = useState<number | null>(null);
  const [overRow, setOverRow] = useState<number | null>(null);
  const [overCol, setOverCol] = useState<number | null>(null);
  const trilhaList = TRILHA_LIB;
  const T = trechos.length;
  const N = rows.length;

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };
  const setStatus = (rid: string, st: BatchRow["status"]) => setRows((rs) => rs.map((r) => r.id === rid ? { ...r, status: st } : r));
  const markAllMod = () => setRows((rs) => rs.map((r) => r.status === "aprovado" ? { ...r, status: "modificado" } : r));

  const saveTrecho = (ti: number, r: number, value: string) => {
    setTrechos((ts) => ts.map((t, i) => {
      if (i !== ti) return t;
      if (t.tipo === "variavel") {
        const vs = (t.variacoes || rows.map(() => "")).slice();
        if (vs[r] !== value) { vs[r] = value; setStatus(rows[r].id, "modificado"); }
        return { ...t, variacoes: vs };
      }
      if (t.content !== value) markAllMod();
      return { ...t, content: value };
    }));
    setTrechoModal(null);
    flash("Trecho atualizado — regere para aprovar");
  };

  const renameTrecho = (ti: number, label: string) => setTrechos((ts) => ts.map((t, i) => i === ti ? { ...t, label } : t));
  const setTipo = (ti: number, tipo: TrechoTipo) => setTrechos((ts) => ts.map((t, i) => {
    if (i !== ti) return t;
    if (tipo === "variavel" && (!t.variacoes || !t.variacoes.length))
      return { ...t, tipo, variacoes: rows.map(() => t.content || "") };
    return { ...t, tipo };
  }));
  const moveTrecho = (ti: number, dir: number) => setTrechos((ts) => {
    const arr = ts.slice(); const to = ti + dir;
    if (to < 0 || to >= arr.length) return ts;
    const [mv] = arr.splice(ti, 1); arr.splice(to, 0, mv);
    return arr;
  });
  const delTrecho = (ti: number) => setTrechos((ts) => ts.length <= 1 ? ts : ts.filter((_, i) => i !== ti));
  const addTrecho = () => setTrechos((ts) => [...ts, { id: "b" + Date.now(), label: "Novo trecho", tipo: "texto" as TrechoTipo, content: "" }]);

  const reorderTrechos = (from: number | null, to: number | null) => {
    if (from == null || to == null || from === to) return;
    setTrechos((ts) => { const a = ts.slice(); const [mv] = a.splice(from, 1); a.splice(to, 0, mv); return a; });
  };
  const reorderVar = (ti: number, from: number | null, to: number | null) => {
    if (from == null || to == null || from === to) return;
    setTrechos((ts) => ts.map((t, i) => {
      if (i !== ti || t.tipo !== "variavel") return t;
      const a = (t.variacoes || []).slice();
      const [mv] = a.splice(from, 1); a.splice(to, 0, mv);
      return { ...t, variacoes: a };
    }));
  };
  const clearDrag = () => { setDragVar(null); setDragCol(null); setOverRow(null); setOverCol(null); };
  const colDragClass = (i: number) =>
    (dragCol === i ? " col-dragging" : "") +
    (overCol === i && dragCol != null && dragCol !== i ? " col-dragover" : "");

  const addRow = () => {
    const id = "v" + Date.now();
    setRows((rs) => [...rs, { id, name: "Variação_" + (rs.length + 1), status: "modificado" }]);
    setTrechos((ts) => ts.map((t) => t.tipo === "variavel" ? { ...t, variacoes: [...(t.variacoes || []), ""] } : t));
    flash("Variação adicionada — preencha e regere");
  };
  const delRow = (r: number) => {
    setTrechos((ts) => ts.map((t) => t.tipo === "variavel" ? { ...t, variacoes: (t.variacoes || []).filter((_, i) => i !== r) } : t));
    setRows((rs) => rs.filter((_, i) => i !== r));
  };
  const dupRow = (r: number) => {
    const src = rows[r]; const id = "v" + Date.now();
    setRows((rs) => { const a = rs.slice(); a.splice(r + 1, 0, { id, name: src.name + "_copia", status: "modificado" }); return a; });
    setTrechos((ts) => ts.map((t) => t.tipo === "variavel" ? { ...t, variacoes: (() => { const a = (t.variacoes || []).slice(); a.splice(r + 1, 0, t.variacoes![r] || ""); return a; })() } : t));
    flash("Variação duplicada");
  };
  const renameRow = (rid: string, name: string) => setRows((rs) => rs.map((r) => r.id === rid ? { ...r, name } : r));

  const download = (r: number) => {
    const dur = durSecFor(trechos, r);
    const bars = makeWaveBars(90, (r + 2) * 29 + 11);
    const blob = encodeWAV(dur, bars);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = rows[r].name.replace(/[^\w\-]+/g, "_") + ".wav";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    flash("Download iniciado · " + rows[r].name);
  };

  const selCount = rows.filter((r) => sel[r.id]).length;
  const approveSelected = () => {
    const ids = new Set(rows.filter((r) => sel[r.id]).map((r) => r.id));
    setRows((rs) => rs.map((r) => ids.has(r.id) ? { ...r, status: "aprovado" } : r));
    setBatchMenu(false);
    flash(ids.size + (ids.size === 1 ? " variação aprovada" : " variações aprovadas"));
  };
  const downloadSelected = () => {
    const idx = rows.map((r, i) => sel[r.id] ? i : -1).filter((i) => i >= 0);
    idx.forEach((i) => download(i));
    setBatchMenu(false);
  };
  const deleteSelected = () => {
    const ids = new Set(rows.filter((r) => sel[r.id]).map((r) => r.id));
    setTrechos((ts) => ts.map((t) => t.tipo === "variavel" ?
      { ...t, variacoes: (t.variacoes || []).filter((_, i) => !ids.has(rows[i].id)) } : t));
    setRows((rs) => rs.filter((r) => !ids.has(r.id)));
    setSel({});
    setBatchMenu(false);
    flash(ids.size + (ids.size === 1 ? " variação excluída" : " variações excluídas"));
  };

  const allSel = N > 0 && rows.every((r) => sel[r.id]);
  const toggleAll = () => { if (allSel) setSel({}); else setSel(Object.fromEntries(rows.map((r) => [r.id, true]))); };

  const col = (i: number) => `${4 + i} / ${5 + i}`;
  const bodyRow = (r: number) => 3 + r;
  const spanAll = `3 / ${3 + N}`;

  return (
    <div className="be-wrap">
      <header className="be-top">
        <div className="ss-header-left">
          <button className="ss-step-back" onClick={onClose} title="Voltar">{Icon.chevLeft({ style: { width: 18, height: 18 } })}</button>
          <button className="ss-model-btn static">
            <span className="mdot" style={{ background: m.color }}></span>{m.name}
          </button>
          <div className="ss-title-wrap">
            {editingTitle ?
              <input autoFocus className="ss-title-input mono"
                value={loteTitle} onChange={(e) => setLoteTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }} /> :
              <button className="ss-title" onClick={() => setEditingTitle(true)}>
                <span className="mono">{loteTitle}</span>
                <span className="ss-title-pencil">{Icon.pencil({ style: { width: 15, height: 15 } })}</span>
              </button>}
          </div>
        </div>
        <div className="be-top-actions">
          <button className="btn btn-primary btn-lg" onClick={addRow}>{Icon.plus({ style: { width: 16, height: 16 } })} Variação</button>
          <button className="be-close icon-btn" onClick={onClose} title="Fechar">{Icon.close()}</button>
        </div>
      </header>

      <div className="be-scroll">
        <div className="be-grid" style={{ ["--T" as any]: T }}>
          <div className="be-corner" style={{ gridColumn: "1 / 2", gridRow: 1 }}>
            <label className="be-check"><input type="checkbox" checked={allSel} onChange={toggleAll} /><span></span></label>
          </div>
          <div className="be-lbl" style={{ gridColumn: "2 / 3", gridRow: 1 }}>#</div>
          <div className="be-lbl" style={{ gridColumn: "3 / 4", gridRow: 1 }}>Variação</div>
          <div className="be-estr-lbl" style={{ gridColumn: `4 / ${4 + T}`, gridRow: 1 }}>
            <span className="be-lbl">Estrutura do Áudio</span>
            <span className="be-trechos-badge">{T} {T === 1 ? "trecho" : "trechos"}</span>
            <button className="be-add-trecho" onClick={addTrecho}>{Icon.plus({ style: { width: 14, height: 14 } })} Adicionar</button>
          </div>
          <div className="be-lbl be-lbl-act" style={{ gridColumn: `${4 + T} / ${5 + T}`, gridRow: 1 }}>Ações</div>

          {trechos.map((t, i) =>
            <div key={"h" + t.id} style={{ gridColumn: col(i), gridRow: 2 }}
              className={"be-thead-wrap" + colDragClass(i)}
              draggable
              onDragStart={(e) => { setDragCol(i); e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { if (dragCol != null) { e.preventDefault(); setOverCol(i); } }}
              onDragLeave={() => setOverCol((c) => c === i ? null : c)}
              onDrop={(e) => { if (dragCol != null) { e.preventDefault(); reorderTrechos(dragCol, i); } clearDrag(); }}
              onDragEnd={clearDrag}>
              <TrechoHeader trecho={t} index={i} count={T}
                onRename={(v) => renameTrecho(i, v)}
                onSetTipo={(tp) => setTipo(i, tp)}
                onMove={(d) => moveTrecho(i, d)}
                onDelete={() => delTrecho(i)} />
            </div>
          )}

          {trechos.map((t, i) => {
            const colDrag = {
              draggable: true,
              onDragStart: (e: React.DragEvent) => { setDragCol(i); e.dataTransfer.effectAllowed = "move"; },
              onDragOver: (e: React.DragEvent) => { if (dragCol != null) { e.preventDefault(); setOverCol(i); } },
              onDrop: (e: React.DragEvent) => { if (dragCol != null) { e.preventDefault(); reorderTrechos(dragCol, i); clearDrag(); } },
              onDragEnd: clearDrag
            };
            if (t.tipo === "texto") {
              const [lead, rest] = leadSplit(t.content || "");
              return <div key={"c" + t.id} className={"be-cell be-texto" + colDragClass(i)} style={{ gridColumn: col(i), gridRow: spanAll }}
                onClick={() => setTrechoModal({ ti: i, r: 0 })} title={t.content} role="button"
                {...colDrag}>
                <div className="be-texto-body">{lead && <b>{lead}</b>}{rest}</div>
                <span className="be-cell-edit">{Icon.pencil({ style: { width: 13, height: 13 } })}</span>
              </div>;
            }
            if (t.tipo === "audio")
              return <div key={"c" + t.id} className={"be-cell be-audiocell" + colDragClass(i)} style={{ gridColumn: col(i), gridRow: spanAll }}
                onClick={() => setTrechoModal({ ti: i, r: 0 })} role="button"
                {...colDrag}>
                <ClipPlayer name={(t.audio && t.audio.name) || "gravacao_fixa.wav"} durationSec={14} seed={(t.id.charCodeAt(1) || 7)} />
              </div>;
            return rows.map((row, r) => {
              const c = rowColor(r);
              const [lead, rest] = leadSplit((t.variacoes && t.variacoes[r]) || "");
              const isVarDragSrc = dragVar && dragVar.ti === i && dragVar.r === r;
              const isVarDragOver = dragVar && dragVar.ti === i && overRow === r && dragVar.r !== r;
              return (
                <div key={"c" + t.id + row.id}
                  className={"be-cell be-var" + colDragClass(i) + (isVarDragSrc ? " dragging" : "") + (isVarDragOver ? " dragover" : "")}
                  style={{ gridColumn: col(i), gridRow: bodyRow(r), background: c.bg, color: c.text }}
                  draggable
                  onDragStart={(e) => { e.stopPropagation(); setDragVar({ ti: i, r }); e.dataTransfer.effectAllowed = "move"; }}
                  onDragOver={(e) => {
                    if (dragCol != null) { e.preventDefault(); setOverCol(i); return; }
                    if (dragVar && dragVar.ti === i) { e.preventDefault(); setOverRow(r); }
                  }}
                  onDragLeave={() => setOverRow((x) => x === r ? null : x)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragCol != null) { reorderTrechos(dragCol, i); }
                    else if (dragVar && dragVar.ti === i) { reorderVar(i, dragVar.r, r); }
                    clearDrag();
                  }}
                  onDragEnd={clearDrag}
                  onClick={() => setTrechoModal({ ti: i, r })}
                  title={(t.variacoes && t.variacoes[r]) || ""}
                  role="button">
                  <span className="be-var-grip">{Icon.drag({ style: { width: 15, height: 15 } })}</span>
                  <div className="be-var-text">{lead && <b>{lead}</b>}{rest}</div>
                </div>);
            });
          })}

          {rows.map((row, r) =>
            <React.Fragment key={"m" + row.id}>
              <div className="be-selcell" style={{ gridColumn: "1 / 2", gridRow: bodyRow(r) }}>
                <label className="be-check"><input type="checkbox" checked={!!sel[row.id]} onChange={() => setSel((s) => ({ ...s, [row.id]: !s[row.id] }))} /><span></span></label>
              </div>
              <div className="be-numcell mono" style={{ gridColumn: "2 / 3", gridRow: bodyRow(r) }}>{String(r + 1).padStart(2, "0")}</div>
              <div className="be-namecell" style={{ gridColumn: "3 / 4", gridRow: bodyRow(r) }}>
                <button className="be-namecard" onClick={() => setDetailRow(r)} title="Editar detalhes do áudio">
                  <span className="be-name mono">{row.name}</span>
                  <StatusPill status={row.status} />
                </button>
              </div>
              <div className="be-actcell" style={{ gridColumn: `${4 + T} / ${5 + T}`, gridRow: bodyRow(r) }}>
                <RowActions row={row}
                  menuOpen={rowMenu === row.id}
                  canDelete={N > 1}
                  onPlay={() => flash("Reproduzindo " + row.name)}
                  onRegen={() => { setStatus(row.id, "pronto"); setRowMenu(null); flash("Áudio regerado — pronto para aprovação"); }}
                  onDownload={() => download(r)}
                  onMenu={() => setRowMenu((mv) => mv === row.id ? null : row.id)}
                  onDetails={() => { setRowMenu(null); setDetailRow(r); }}
                  onApprove={() => { setRowMenu(null); setConfirm({ kind: "approve", r }); }}
                  onDuplicate={() => { setRowMenu(null); dupRow(r); }}
                  onDelete={() => { setRowMenu(null); setConfirm({ kind: "delete", r }); }} />
              </div>
            </React.Fragment>
          )}
        </div>
      </div>

      <footer className="ss-footer be-footer">
        <div className="ss-footer-info">
          <span className="mono ss-footer-dur">{String(N).padStart(2, "0")}</span>
          <span>{N === 1 ? "áudio no lote" : "áudios no lote"}</span>
          <button className="btn btn-ghost btn-sm be-help-btn" onClick={() => onRequestHelp && onRequestHelp({ kind: "lote", title: loteTitle })}>
            {Icon.help({ style: { width: 16, height: 16 } })} Preciso de ajuda
          </button>
        </div>
        <div className="be-foot-trilha">
          <span className="be-trilha-lbl">Trilha</span>
          {trilha ?
            <div className="ss-trilha-card filled be-foot-trilhacard">
              <span className="ss-trilha-ic">{Icon.music({ style: { width: 18, height: 18 } })}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ss-trilha-name">{trilha.name}</div>
                <div className="ss-trilha-mood">Trilha do lote</div>
              </div>
              <button className="be-trilha-edit" onClick={() => setTrilhaOpen(true)} title="Trocar trilha">{Icon.pencil({ style: { width: 15, height: 15 } })}</button>
              <button className="ss-trecho-del" onClick={() => setTrilha(null)} title="Remover trilha">{Icon.close({ style: { width: 15, height: 15 } })}</button>
            </div> :
            <button className="ss-trilha-card empty be-foot-trilhacard" onClick={() => setTrilhaOpen(true)}>
              <span className="ss-trilha-ic dim">{Icon.music({ style: { width: 18, height: 18 } })}</span>
              <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                <div className="ss-trilha-name dim">Nenhuma trilha adicionada</div>
                <div className="ss-trilha-mood">Adicionar trilha</div>
              </div>
              <span className="ss-trilha-plus">{Icon.plus({ style: { width: 16, height: 16 } })}</span>
            </button>}
        </div>
        <div className="ss-footer-actions">
          <button className="btn btn-primary btn-lg" onClick={() => { flash("Lote salvo"); onComplete && onComplete(); }}>
            {Icon.check({ style: { width: 16, height: 16 } })} Salvar
          </button>
          {selCount > 1 &&
            <div className="be-batchactions">
              <button className={"btn btn-ghost btn-lg" + (batchMenu ? " open" : "")} onClick={() => setBatchMenu((o) => !o)}>
                Ações em Lote {Icon.chevDown({ style: { width: 16, height: 16 } })}
              </button>
              {batchMenu &&
                <>
                  <div className="be-menu-scrim" onClick={() => setBatchMenu(false)}></div>
                  <div className="be-menu right up-menu anim-up">
                    <div className="be-menu-grp">{selCount} Selecionados</div>
                    <button className="be-menu-item" onClick={approveSelected}>{Icon.check({ style: { width: 15, height: 15 } })} Aprovar</button>
                    <button className="be-menu-item" onClick={downloadSelected}>{Icon.download({ style: { width: 15, height: 15 } })} Baixar</button>
                    <div className="be-menu-div"></div>
                    <button className="be-menu-item danger" onClick={deleteSelected}>{Icon.trash({ style: { width: 15, height: 15 } })} Excluir</button>
                  </div>
                </>}
            </div>}
        </div>
      </footer>

      {trechoModal &&
        <TrechoModal
          trecho={trechos[trechoModal.ti]}
          rowIndex={trechoModal.r}
          rowName={rows[trechoModal.r] ? rows[trechoModal.r].name : ""}
          onClose={() => setTrechoModal(null)}
          onSave={(v) => saveTrecho(trechoModal.ti, trechoModal.r, v)}
          onSetAudio={() => { setTrechos((ts) => ts.map((t, i) => i === trechoModal.ti ? { ...t, audio: null } : t)); setTrechoModal(null); }} />}

      {detailRow != null && rows[detailRow] &&
        <DetalhesModal
          row={rows[detailRow]} rowIndex={detailRow} trechos={trechos}
          onClose={() => setDetailRow(null)}
          onRename={(name) => renameRow(rows[detailRow!].id, name)}
          onStatus={(st) => setStatus(rows[detailRow!].id, st)}
          onDownload={() => download(detailRow)}
          onCopyToast={() => flash("Roteiro copiado")} />}

      {confirm &&
        <div className="md-scrim anim-in" onClick={() => setConfirm(null)}>
          <div className="md-box anim-up" onClick={(e) => e.stopPropagation()}>
            <div className="md-head">
              <div>
                <h3 className="md-title">{confirm.kind === "approve" ? "Aprovar este áudio?" : "Excluir variação?"}</h3>
                <p className="md-sub">
                  {confirm.kind === "approve" ?
                    "Ao aprovar, “" + rows[confirm.r].name + "” fica disponível para download." :
                    "“" + rows[confirm.r].name + "” será removida do lote. Esta ação não pode ser desfeita."}
                </p>
              </div>
            </div>
            <div className="be-modal-foot">
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancelar</button>
              {confirm.kind === "approve" ?
                <button className="btn btn-primary" onClick={() => { setStatus(rows[confirm.r].id, "aprovado"); setConfirm(null); flash("Variação aprovada"); }}>
                  {Icon.check({ style: { width: 16, height: 16 } })} Aprovar
                </button> :
                <button className="btn btn-danger" onClick={() => { delRow(confirm.r); setConfirm(null); }}>
                  {Icon.trash({ style: { width: 16, height: 16 } })} Excluir
                </button>}
            </div>
          </div>
        </div>}

      {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}

      {trilhaOpen &&
        <div className="md-scrim anim-in" onClick={() => setTrilhaOpen(false)}>
          <div className="md-box anim-up" onClick={(e) => e.stopPropagation()}>
            <div className="md-head">
              <div>
                <h3 className="md-title">Trilha de fundo</h3>
                <p className="md-sub">Escolha uma trilha para acompanhar o lote de áudios</p>
              </div>
              <button className="icon-btn" onClick={() => setTrilhaOpen(false)}>{Icon.close()}</button>
            </div>
            <div className="tr-list">
              {trilhaList.map((t) =>
                <button key={t.id} className={"tr-item" + (trilha && trilha.id === t.id ? " active" : "")}
                  onClick={() => { setTrilha(t); setTrilhaOpen(false); flash("Trilha adicionada ao lote"); }}>
                  <span className="tr-ic">{Icon.music({ style: { width: 18, height: 18 } })}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="tr-name">{t.name}</div>
                    <div className="tr-mood">{t.genre} · <span className="mono">{t.durSec}s</span></div>
                  </div>
                  {trilha && trilha.id === t.id && <span className="tr-check">{Icon.check({ style: { width: 16, height: 16 } })}</span>}
                </button>
              )}
            </div>
            {trilha && <button className="tr-remove" onClick={() => { setTrilha(null); setTrilhaOpen(false); }}>Remover trilha atual</button>}
          </div>
        </div>}
    </div>);
}
