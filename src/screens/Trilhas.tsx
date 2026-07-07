/* ============================================================
   AMPLI — Tela "Trilhas"  (CRUD de trilhas de áudio)
   Mesmo look & feel de "Meus Áudios". O botão primário faz Upload:
   ao escolher um arquivo, abre um modal (nome + campanha), e ao
   confirmar conclui o envio e adiciona a trilha à biblioteca.
   ============================================================ */
import { useMemo, useState, useRef, useEffect } from "react";
import { Icon } from "../components/Icon";
import { MiniWave } from "../components/Waveform";
import { makeWaveBars } from "../lib/audioEngine";
import { TRILHA_GENRES, TRILHA_LIB, CAMPAIGNS } from "../data/mockData";
import { ViewPrefs } from "./MyAudios";
import type { Trilha } from "../types";

/* ---- formatters ---- */
export function fmtDur(sec?: number | null) {
  if (sec == null || isNaN(sec)) return "··:··";
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}
export function fmtBytes(b?: number | null) {
  if (b == null) return "—";
  if (b < 1024) return b + " B";
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + " KB";
  return (b / (1024 * 1024)).toFixed(1) + " MB";
}

function usedLabel(n?: number) {
  const v = n || 0;
  return v + (v === 1 ? " Áudio" : " Áudios");
}

export function GenreTag({ id, sm }: { id?: string; sm?: boolean }) {
  const g = TRILHA_GENRES[id || "sem"] || TRILHA_GENRES.sem;
  return (
    <span className="tag" style={{ height: sm ? 24 : 28, fontSize: sm ? 10.5 : 11.5 }}>
      <span className="mdot" style={{ background: g.color }}></span>{g.name}
    </span>
  );
}

function Equalizer() {
  return (<span className="tr-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>);
}

function PlayBtn({ playing, onClick, big }: { playing: boolean; onClick: (e: React.MouseEvent) => void; big?: boolean }) {
  const cls = big ? "ac-play" : "mt-play";
  return (
    <button className={cls + (playing ? " playing" : "")} onClick={onClick}
      aria-label={playing ? "Pausar" : "Reproduzir"}>
      {playing
        ? Icon.pause({ style: { width: big ? 16 : 13, height: big ? 16 : 13 } })
        : Icon.play({ style: { width: big ? 16 : 13, height: big ? 16 : 13 } })}
    </button>
  );
}

export function CampaignCombo({ value, onChange, campaigns, onCreateCampaign }: {
  value: string; onChange: (v: string) => void; campaigns: string[]; onCreateCampaign: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ql = query.trim();
  const qll = ql.toLowerCase();
  const matches = campaigns.filter((c) => c.toLowerCase().includes(qll));
  const exact = campaigns.some((c) => c.toLowerCase() === qll);
  const showCreate = ql.length > 0 && !exact;

  const close = () => { setOpen(false); setQuery(""); };
  const pick = (c: string) => { onChange(c); close(); };
  const create = () => { onCreateCampaign(ql); onChange(ql); close(); };

  return (
    <div className="cb-wrap">
      <button type="button" className={"cb-trigger" + (open ? " open" : "")} onClick={() => setOpen((o) => !o)}>
        {value
          ? <span className="cb-val">{Icon.flag({ style: { width: 14, height: 14, marginRight: 8, flex: "none", opacity: 0.7, verticalAlign: "-2px" } })}{value}</span>
          : <span className="cb-ph">Selecione ou crie uma campanha…</span>}
        <span className="cb-caret">{Icon.chevDown({ style: { width: 15, height: 15 } })}</span>
      </button>
      {open && (
        <>
          <div className="cb-scrim" onClick={close}></div>
          <div className="cb-pop anim-up">
            <div className="cb-search">
              <span className="cb-search-ic">{Icon.search({ style: { width: 15, height: 15 } })}</span>
              <input className="field" style={{ height: 40, paddingLeft: 38, fontSize: 13.5 }} autoFocus
                placeholder="Buscar ou nomear campanha…"
                value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (showCreate) create(); else if (matches[0]) pick(matches[0]); } }} />
            </div>
            <div className="cb-list">
              {matches.map((c) => (
                <button type="button" key={c} className={"cb-opt" + (c === value ? " sel" : "")} onClick={() => pick(c)}>
                  <span className="cb-opt-ic">{Icon.flag({ style: { width: 15, height: 15 } })}</span>
                  <span className="cb-opt-name">{c}</span>
                  {c === value && <span className="cb-check">{Icon.check({ style: { width: 15, height: 15 } })}</span>}
                </button>
              ))}
              {!matches.length && !showCreate && <div className="cb-empty">Nenhuma campanha encontrada</div>}
              {showCreate && (
                <button type="button" className="cb-create" onClick={create}>
                  {Icon.plus({ style: { width: 15, height: 15 } })} Criar campanha "{ql}"
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---- Table (datatable) view ---- */
export function TrilhaTable({ list, playingId, onPlay, onMore, onOpenCampaign, sortKey, sortDir, onSort }: {
  list: Trilha[]; playingId: string | null; onPlay: (t: Trilha) => void; onMore: (t: Trilha, rect: DOMRect) => void;
  onOpenCampaign?: (name: string) => void; sortKey: string; sortDir: "asc" | "desc"; onSort: (k: string) => void;
}) {
  const SortHead = ({ k, children, num }: { k: string; children: React.ReactNode; num?: boolean }) => (
    <th className={"mt-th sortable" + (num ? " num" : "") + (sortKey === k ? " active" : "")}
      onClick={() => onSort(k)}>
      <span className="mt-th-inner">
        {children}
        <span className="mt-sort-ic">
          {sortKey === k
            ? (sortDir === "asc" ? Icon.arrowUp({ style: { width: 13, height: 13 } }) : Icon.arrowDown({ style: { width: 13, height: 13 } }))
            : Icon.arrowDown({ style: { width: 13, height: 13, opacity: 0.25 } })}
        </span>
      </span>
    </th>
  );
  return (
    <div className="mt-wrap anim-up">
      <table className="ma-table">
        <thead>
          <tr>
            <SortHead k="title">Nome da trilha</SortHead>
            <SortHead k="campaign">Campanha</SortHead>
            <SortHead k="used">Usada em</SortHead>
            <SortHead k="dur" num>Duração</SortHead>
            <SortHead k="size" num>Tamanho</SortHead>
            <SortHead k="date">Enviada</SortHead>
            <th className="mt-th" style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.map((t, i) => {
            const playing = playingId === t.id;
            return (
              <tr key={t.id} className={"mt-row" + (playing ? " is-playing" : "")} style={{ animationDelay: (i * 0.022) + "s" }}
                onClick={() => onPlay(t)}>
                <td className="mt-td mt-title">
                  <PlayBtn playing={playing} onClick={(e) => { e.stopPropagation(); onPlay(t); }} />
                  <div className="mt-title-text">
                    <span className="mt-name">{t.name}</span>
                    {playing && <Equalizer />}
                    {t.isNew && !playing && <span className="tr-new">Nova</span>}
                  </div>
                </td>
                <td className="mt-td mt-muted">
                  {t.campaign
                    ? <button className="tr-camp-link" title={"Ver detalhe da campanha: " + t.campaign}
                      onClick={(e) => { e.stopPropagation(); onOpenCampaign && onOpenCampaign(t.campaign!); }}>
                      <span className="tr-camp-txt">{t.campaign}</span>
                    </button>
                    : <span className="tr-camp-none">—</span>}
                </td>
                <td className="mt-td">
                  <span className={"tr-used" + ((t.usedIn || 0) === 0 ? " zero" : "")}>
                    {Icon.waveform({ style: { width: 13, height: 13 } })}{usedLabel(t.usedIn)}
                  </span>
                </td>
                <td className="mt-td num mono">{fmtDur(t.durSec)}</td>
                <td className="mt-td num mono">{fmtBytes(t.bytes)}</td>
                <td className="mt-td mt-muted">{t.date}</td>
                <td className="mt-td">
                  <button className="ac-more icon-btn" style={{ width: 30, height: 30, border: "none" }}
                    onClick={(e) => { e.stopPropagation(); onMore(t, e.currentTarget.getBoundingClientRect()); }}>{Icon.more()}</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- Grid card view ---- */
export function TrilhaCard({ t, index, playingId, onPlay, onMore, onOpenCampaign }: {
  t: Trilha; index: number; playingId: string | null; onPlay: (t: Trilha) => void; onMore: (t: Trilha, rect: DOMRect) => void; onOpenCampaign?: (name: string) => void;
}) {
  const bars = useMemo(() => makeWaveBars(48, (t.name.charCodeAt(0) || 80) * 7 + (t.durSec || 30)), [t.id, t.durSec]);
  const playing = playingId === t.id;
  return (
    <div className="ac-card anim-up" style={{ animationDelay: (index * 0.035) + "s" }} onClick={() => onPlay(t)}>
      <div className="ac-top">
        <GenreTag id={t.genre} sm />
        <span style={{ flex: 1 }}></span>
        {t.isNew && <span className="tr-new">Nova</span>}
        <button className="ac-more icon-btn" style={{ width: 30, height: 30, border: "none" }}
          onClick={(e) => { e.stopPropagation(); onMore(t, e.currentTarget.getBoundingClientRect()); }}>{Icon.more()}</button>
      </div>

      <h3 className="ac-name" style={{ minHeight: 0, WebkitLineClamp: 1, marginBottom: 0 }}>{t.name}</h3>
      {t.campaign && <button className="ac-campaign tr-camp-link" onClick={(e) => { e.stopPropagation(); onOpenCampaign && onOpenCampaign(t.campaign!); }}>{t.campaign}</button>}

      <div className="ac-wave">
        <PlayBtn big playing={playing} onClick={(e) => { e.stopPropagation(); onPlay(t); }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <MiniWave bars={bars} active={playing} color={(TRILHA_GENRES[t.genre || "sem"] || TRILHA_GENRES.sem).color} height={30} />
        </div>
      </div>

      <div className="ac-foot">
        <span className="ac-meta"><span className="mono">{fmtDur(t.durSec)}</span></span>
        <span className="ac-dot">·</span>
        <span className="ac-meta">{usedLabel(t.usedIn)}</span>
        <span className="ac-dot">·</span>
        <span className="ac-meta"><span className="mono">{fmtBytes(t.bytes)}</span></span>
        <span style={{ flex: 1 }}></span>
        <span className="ac-date">{t.date}</span>
      </div>
    </div>
  );
}

/* ---- "more" dropdown (Editar / Duplicar / Baixar / Excluir) ---- */
function TrilhaMenu({ pos, hasFile, onClose, onEdit, onDuplicate, onDownload, onDelete }: {
  pos: { top: number; right: number }; hasFile: boolean; onClose: () => void; onEdit: () => void; onDuplicate: () => void; onDownload: () => void; onDelete: () => void;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 59 }}></div>
      <div className="mm-menu anim-up" style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}>
        <button className="mm-item" onClick={onEdit}>{Icon.pencil({ style: { width: 15, height: 15 } })} Editar</button>
        <button className="mm-item" onClick={onDuplicate}>{Icon.copy({ style: { width: 15, height: 15 } })} Duplicar</button>
        {hasFile && <button className="mm-item" onClick={onDownload}>{Icon.download({ style: { width: 15, height: 15 } })} Baixar</button>}
        <div className="mm-sep"></div>
        <button className="mm-item danger" onClick={onDelete}>{Icon.trash({ style: { width: 15, height: 15 } })} Excluir</button>
      </div>
    </>
  );
}

interface QueuedFile { id: string; filename: string; name: string; bytes: number; durSec: number | null; url: string }

/* ---- Upload modal: fill name + campaign, then conclude the upload ---- */
function UploadModal({ file, queueInfo, campaigns, onCreateCampaign, onConfirm, onCancel }: {
  file: QueuedFile; queueInfo?: string | null; campaigns: string[]; onCreateCampaign: (n: string) => void;
  onConfirm: (v: { name: string; campaign: string }) => void; onCancel: () => void;
}) {
  const [name, setName] = useState(file.name);
  const [campaign, setCampaign] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (ivRef.current) clearInterval(ivRef.current); }, []);

  const ready = name.trim().length > 0 && campaign.length > 0 && !uploading;
  const confirm = () => {
    if (!ready) return;
    setUploading(true);
    let p = 0;
    ivRef.current = setInterval(() => {
      p += Math.random() * 20 + 12;
      if (p >= 100) {
        p = 100; if (ivRef.current) clearInterval(ivRef.current); ivRef.current = null; setPct(100);
        setTimeout(() => onConfirm({ name: name.trim(), campaign }), 320);
      } else setPct(p);
    }, 110);
  };

  return (
    <div className="md-scrim anim-in" onClick={uploading ? undefined : onCancel}>
      <div className="md-box anim-up" onClick={(e) => e.stopPropagation()}>
        <div className="md-head">
          <div>
            <h3 className="md-title">Nova trilha</h3>
            <p className="md-sub">{queueInfo || "Defina o nome e a campanha desta trilha."}</p>
          </div>
          {!uploading && <button className="icon-btn" onClick={onCancel}>{Icon.close()}</button>}
        </div>
        <div className="md-body">
          <div className="up-file">
            <span className="up-file-ic">{Icon.music({ style: { width: 20, height: 20 } })}</span>
            <div className="up-file-meta">
              <div className="up-file-name">{file.filename}</div>
              {uploading
                ? <><div className="up-bar"><div className="up-bar-fill" style={{ width: pct + "%" }}></div></div>
                  <div className="up-file-sub">{pct >= 100 ? "Upload concluído" : "Enviando… " + Math.round(pct) + "%"}</div></>
                : <div className="up-file-sub">{fmtBytes(file.bytes)} · {fmtDur(file.durSec)}</div>}
            </div>
            {uploading && pct >= 100 && <span className="up-done">{Icon.check({ style: { width: 18, height: 18 } })}</span>}
          </div>

          <div className="tr-form-row">
            <label className="tr-form-label">Nome da trilha</label>
            <input className="field" value={name} autoFocus disabled={uploading}
              placeholder="Ex.: Energia Varejo"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirm(); }} />
          </div>
          <div className="tr-form-row" style={uploading ? { opacity: 0.55, pointerEvents: "none" } : undefined}>
            <label className="tr-form-label">Campanha</label>
            <CampaignCombo value={campaign} onChange={setCampaign}
              campaigns={campaigns} onCreateCampaign={onCreateCampaign} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
            {!uploading && <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>}
            <button className="btn btn-primary" disabled={!ready} onClick={confirm}>
              {uploading
                ? <><span className="sp-spinner sm"></span> Enviando…</>
                : <>{Icon.upload()} Concluir upload</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Edit / details modal ---- */
function EditTrilhaModal({ trilha, campaigns, onCreateCampaign, onClose, onSave }: {
  trilha: Trilha; campaigns: string[]; onCreateCampaign: (n: string) => void; onClose: () => void; onSave: (t: Trilha) => void;
}) {
  const [name, setName] = useState(trilha.name);
  const [campaign, setCampaign] = useState(trilha.campaign || "");
  const [genre, setGenre] = useState(trilha.genre);
  const [bpm, setBpm] = useState(trilha.bpm ? String(trilha.bpm) : "");
  const save = () => {
    const clean = name.trim() || trilha.name;
    onSave({ ...trilha, name: clean, campaign, genre, bpm: bpm ? Math.max(0, parseInt(bpm, 10) || 0) : null, isNew: false });
  };
  return (
    <div className="md-scrim anim-in" onClick={onClose}>
      <div className="md-box anim-up" onClick={(e) => e.stopPropagation()}>
        <div className="md-head">
          <div>
            <h3 className="md-title">Editar trilha</h3>
            <p className="md-sub">Ajuste o nome, a campanha e os detalhes.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>{Icon.close()}</button>
        </div>
        <div className="md-body">
          <div className="tr-form-row">
            <label className="tr-form-label">Nome da trilha</label>
            <input className="field" value={name} autoFocus
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
          </div>
          <div className="tr-form-row">
            <label className="tr-form-label">Campanha</label>
            <CampaignCombo value={campaign} onChange={setCampaign}
              campaigns={campaigns} onCreateCampaign={onCreateCampaign} />
          </div>
          <div className="tr-form-grid">
            <div className="tr-form-row" style={{ marginBottom: 0 }}>
              <label className="tr-form-label">Categoria</label>
              <div className="vp-control">
                <select className="vp-select" value={genre} onChange={(e) => setGenre(e.target.value)}>
                  {Object.values(TRILHA_GENRES).map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
                <span className="vp-select-chev">{Icon.chevDown({ style: { width: 15, height: 15 } })}</span>
              </div>
            </div>
            <div className="tr-form-row" style={{ marginBottom: 0 }}>
              <label className="tr-form-label">BPM</label>
              <input className="field" type="number" min="0" placeholder="—"
                value={bpm} onChange={(e) => setBpm(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
            </div>
          </div>
          <div className="tr-meta-line">
            <span>{fmtDur(trilha.durSec)} de duração</span>
            <span className="ac-dot">·</span>
            <span>{fmtBytes(trilha.bytes)}</span>
            <span className="ac-dot">·</span>
            <span>Enviada {trilha.date}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>{Icon.check()} Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
export interface TrilhasProps {
  theme?: string;
  items?: Trilha[];
  setItems?: React.Dispatch<React.SetStateAction<Trilha[]>>;
  onOpenCampaign?: (name: string) => void;
}

export function Trilhas({ items: itemsProp, setItems: setItemsProp, onOpenCampaign }: TrilhasProps) {
  const [localItems, setLocalItems] = useState<Trilha[]>(() => TRILHA_LIB);
  const items = itemsProp || localItems;
  const setItems = setItemsProp || setLocalItems;
  const [campaigns, setCampaigns] = useState<string[]>(() => CAMPAIGNS);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("all");
  const [view, setView] = useState("table");
  const [perPage, setPerPage] = useState(20);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [menu, setMenu] = useState<{ t: Trilha; top: number; right: number } | null>(null);
  const [editing, setEditing] = useState<Trilha | null>(null);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const demoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const addCampaign = (name: string) => {
    const n = name.trim(); if (!n) return;
    setCampaigns((list) => list.some((c) => c.toLowerCase() === n.toLowerCase()) ? list : [n, ...list]);
  };

  const stopAll = () => {
    if (audioRef.current) audioRef.current.pause();
    if (demoTimer.current) { clearTimeout(demoTimer.current); demoTimer.current = null; }
  };
  useEffect(() => () => { stopAll(); }, []);

  const togglePlay = (t: Trilha) => {
    if (playingId === t.id) { stopAll(); setPlayingId(null); return; }
    stopAll();
    setPlayingId(t.id);
    if (t.url) {
      const a = audioRef.current!;
      a.src = t.url; a.currentTime = 0;
      a.play().catch(() => {});
    } else {
      demoTimer.current = setTimeout(() => setPlayingId(null), Math.min(t.durSec || 4, 6) * 1000);
    }
  };

  const openPicker = () => fileRef.current && fileRef.current.click();
  const queueFiles = (fileList: FileList | null) => {
    const files = [...(fileList || [])].filter((f) => f.type.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac|aiff?)$/i.test(f.name));
    if (!files.length) { flash("Selecione arquivos de áudio"); return; }
    const base = Date.now();
    const pend: QueuedFile[] = files.map((f, i) => {
      const url = URL.createObjectURL(f);
      const id = "up" + base + i;
      const probe = new Audio();
      probe.preload = "metadata";
      probe.src = url;
      probe.onloadedmetadata = () => {
        const d = isFinite(probe.duration) ? Math.round(probe.duration) : null;
        setQueue((qd) => qd.map((x) => x.id === id ? { ...x, durSec: d } : x));
      };
      return { id, filename: f.name, name: f.name.replace(/\.[^.]+$/, ""), bytes: f.size, durSec: null, url };
    });
    setQueue((qd) => [...qd, ...pend]);
  };
  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => { queueFiles(e.target.files); e.target.value = ""; };

  const current = queue[0] || null;
  const confirmUpload = ({ name, campaign }: { name: string; campaign: string }) => {
    if (!current) return;
    addCampaign(campaign);
    const trilha: Trilha = {
      id: current.id, name, campaign, genre: "sem", bpm: null,
      durSec: current.durSec ?? undefined, bytes: current.bytes, usedIn: 0, ts: Date.now(), date: "Agora",
      url: current.url, isNew: true,
    };
    setItems((list) => [trilha, ...list]);
    setSortKey("date"); setSortDir("desc");
    setQueue((qd) => qd.slice(1));
    flash("Trilha “" + name + "” criada com sucesso");
  };
  const cancelUpload = () => {
    if (current && current.url) URL.revokeObjectURL(current.url);
    setQueue((qd) => qd.slice(1));
  };

  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragDepth.current++; setDragOver(true); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); dragDepth.current--; if (dragDepth.current <= 0) { dragDepth.current = 0; setDragOver(false); } };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); dragDepth.current = 0; setDragOver(false); if (e.dataTransfer && e.dataTransfer.files) queueFiles(e.dataTransfer.files); };

  const openMenu = (t: Trilha, rect: DOMRect) => setMenu({ t, top: rect.bottom + 6, right: Math.max(16, window.innerWidth - rect.right) });
  const closeMenu = () => setMenu(null);
  const doEdit = () => { const t = menu && menu.t; closeMenu(); if (t) setEditing(t); };
  const doDuplicate = () => {
    const t = menu && menu.t; closeMenu(); if (!t) return;
    setItems((list) => { const i = list.findIndex((x) => x.id === t.id); const copy = { ...t, id: t.id + "-c" + Date.now(), name: t.name + " (cópia)", usedIn: 0, ts: Date.now(), date: "Agora", isNew: false }; const nx = [...list]; nx.splice(i + 1, 0, copy); return nx; });
    flash("Trilha duplicada");
  };
  const doDownload = () => {
    const t = menu && menu.t; closeMenu(); if (!t || !t.url) return;
    const a = document.createElement("a"); a.href = t.url; a.download = t.name; a.click(); flash("Baixando trilha");
  };
  const doDelete = () => {
    const t = menu && menu.t; closeMenu(); if (!t) return;
    if (playingId === t.id) { stopAll(); setPlayingId(null); }
    if (t.url) URL.revokeObjectURL(t.url);
    setItems((list) => list.filter((x) => x.id !== t.id)); flash("Trilha excluída");
  };

  const saveEdit = (next: Trilha) => { setItems((list) => list.map((x) => x.id === next.id ? next : x)); setEditing(null); flash("Trilha atualizada"); };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((t) => {
      if (genre !== "all" && t.genre !== genre) return false;
      if (!ql) return true;
      return t.name.toLowerCase().includes(ql)
        || (t.campaign && t.campaign.toLowerCase().includes(ql))
        || (TRILHA_GENRES[t.genre || "sem"]?.name.toLowerCase().includes(ql));
    });
  }, [q, genre, items]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let r: number;
      if (sortKey === "title") r = a.name.localeCompare(b.name, "pt");
      else if (sortKey === "campaign") r = (a.campaign || "").localeCompare(b.campaign || "", "pt");
      else if (sortKey === "used") r = (a.usedIn || 0) - (b.usedIn || 0);
      else if (sortKey === "dur") r = (a.durSec || 0) - (b.durSec || 0);
      else if (sortKey === "size") r = (a.bytes || 0) - (b.bytes || 0);
      else r = (a.ts || 0) - (b.ts || 0);
      return sortDir === "asc" ? r : -r;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const visible = useMemo(() => sorted.slice(0, perPage), [sorted, perPage]);

  const onSort = (k: string) => {
    if (sortKey === k) { setSortDir((d) => d === "asc" ? "desc" : "asc"); }
    else { setSortKey(k); setSortDir(k === "title" || k === "campaign" ? "asc" : "desc"); }
  };

  return (
    <div className="ma-page" onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
      <div className="diag-bg"></div>
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} style={{ display: "none" }}></audio>
      <input ref={fileRef} type="file" accept="audio/*" multiple onChange={onFileInput} style={{ display: "none" }} />

      <div className="ma-inner">
        <div className="ma-head anim-up">
          <div>
            <div className="u-label" style={{ marginBottom: 10 }}>Biblioteca</div>
            <h1 className="display ma-title">Trilhas</h1>
            <p className="ma-sub">{items.length} trilhas · fundo musical para seus áudios, prontas para usar</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={openPicker}>
            {Icon.upload()} Upload
          </button>
        </div>

        <div className="ma-toolbar anim-up" style={{ animationDelay: ".05s" }}>
          <div className="ma-search">
            <span className="ma-search-ic">{Icon.search()}</span>
            <input className="field" style={{ paddingLeft: 42, height: 46 }}
              placeholder="Filtrar por nome, campanha ou categoria…"
              value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button className="ma-clear" onClick={() => setQ("")}>{Icon.close()}</button>}
          </div>
          <div className="ma-viewwrap">
            <button className={"ma-viewbtn" + (prefsOpen ? " active" : "")} onClick={() => setPrefsOpen((o) => !o)}
              title="Preferências de visualização">
              {Icon.sliders({ style: { width: 18, height: 18 } })}
            </button>
            {prefsOpen && (
              <ViewPrefs perPage={perPage} setPerPage={setPerPage}
                view={view} setView={setView} onClose={() => setPrefsOpen(false)} />
            )}
          </div>
        </div>

        {visible.length ? (
          view === "table"
            ? <TrilhaTable list={visible} playingId={playingId} onPlay={togglePlay} onMore={openMenu} onOpenCampaign={onOpenCampaign}
              sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            : <div className="ma-grid">
              {visible.map((t, i) => <TrilhaCard key={t.id} t={t} index={i} playingId={playingId} onPlay={togglePlay} onMore={openMenu} onOpenCampaign={onOpenCampaign} />)}
            </div>
        ) : (
          <div className="ma-empty anim-in">
            <div className="ma-empty-ic">{Icon.music({ style: { width: 30, height: 30 } })}</div>
            <h3>{q || genre !== "all" ? "Nenhuma trilha encontrada" : "Sua biblioteca está vazia"}</h3>
            <p>{q || genre !== "all" ? "Tente outro termo ou limpe os filtros." : "Faça upload de arquivos de áudio para começar — arraste e solte aqui, ou use o botão Upload."}</p>
            {q || genre !== "all"
              ? <button className="btn btn-ghost" onClick={() => { setQ(""); setGenre("all"); }}>Limpar filtros</button>
              : <button className="btn btn-primary" onClick={openPicker}>{Icon.upload()} Upload de trilha</button>}
          </div>
        )}

        {visible.length > 0 && (
          <div className="ma-count">{visible.length} de {sorted.length} {sorted.length === 1 ? "trilha" : "trilhas"}</div>
        )}
      </div>

      {dragOver && (
        <div className="tr-dropmask">
          <div className="tr-dropcard">
            <div className="tr-dropic">{Icon.upload({ style: { width: 34, height: 34 } })}</div>
            <div className="tr-droptitle">Solte para enviar</div>
            <div className="tr-dropsub">Arquivos de áudio (MP3, WAV, M4A…)</div>
          </div>
        </div>
      )}

      {current && (
        <UploadModal
          file={current}
          queueInfo={queue.length > 1 ? ("Arquivo 1 de " + queue.length + " · defina o nome e a campanha.") : null}
          campaigns={campaigns}
          onCreateCampaign={addCampaign}
          onConfirm={confirmUpload}
          onCancel={cancelUpload} />
      )}

      {menu && <TrilhaMenu pos={menu} hasFile={!!(menu.t && menu.t.url)} onClose={closeMenu}
        onEdit={doEdit} onDuplicate={doDuplicate} onDownload={doDownload} onDelete={doDelete} />}
      {editing && <EditTrilhaModal trilha={editing} campaigns={campaigns} onCreateCampaign={addCampaign}
        onClose={() => setEditing(null)} onSave={saveEdit} />}
      {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}
    </div>
  );
}
