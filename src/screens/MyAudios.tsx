/* ============================================================
   AMPLI — Tela "Meus Áudios"
   ============================================================ */
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { MiniWave } from "../components/Waveform";
import { makeWaveBars } from "../lib/audioEngine";
import { MODELS, LIBRARY } from "../data/mockData";
import type { Campaign, LibraryAudio, ModelId } from "../types";

export function ModelTag({ id, sm }: { id: ModelId; sm?: boolean }) {
  const m = MODELS[id] || MODELS.spot;
  return (
    <span className="tag" style={{ height: sm ? 24 : 28, fontSize: sm ? 10.5 : 11.5 }}>
      <span className="mdot" style={{ background: m.color }}></span>{m.name}
    </span>
  );
}

export function typeIcon(kind: string, style?: React.CSSProperties) {
  return kind === "batch" ? Icon.layers(style ? { style } : undefined) : Icon.waveform(style ? { style } : undefined);
}

export function CampaignLabel({ name }: { name?: string }) {
  return (
    <span className={"ac-campaign" + (name ? " is-set" : "")}>{name || "Sem Campanha"}</span>
  );
}

function AudioCard({ a, index, onOpen, onMore, theme }: {
  a: LibraryAudio; index: number; onOpen?: (a: LibraryAudio) => void;
  onMore?: (a: LibraryAudio, rect: DOMRect) => void; theme?: string;
}) {
  const bars = useMemo(() => makeWaveBars(56, a.id.charCodeAt(1) * 7 + a.trechos), [a.id, a.trechos]);
  const [hover, setHover] = useState(false);
  const isBatch = a.kind === "batch";
  return (
    <div className="ac-card anim-up" style={{ animationDelay: (index * 0.035) + "s" }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onClick={() => onOpen && onOpen(a)}>
      <div className="ac-top">
        <ModelTag id={a.model} sm />
        <span style={{ flex: 1 }}></span>
        {a.status === "rascunho"
          ? <span className="tag" style={{ height: 24, fontSize: 10.5, color: "var(--tx-faint)" }}>Rascunho</span>
          : null}
        <button className="ac-more icon-btn" style={{ width: 30, height: 30, border: "none" }}
          onClick={(e) => { e.stopPropagation(); onMore && onMore(a, e.currentTarget.getBoundingClientRect()); }}>{Icon.more()}</button>
      </div>

      <div className="ac-head2">
        <h3 className="ac-name">{a.name}</h3>
        <CampaignLabel name={a.campaign} />
      </div>

      <div className="ac-wave">
        <button className="ac-play" onClick={(e) => { e.stopPropagation(); onOpen && onOpen(a); }}>
          {Icon.play()}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <MiniWave bars={bars} active={hover} theme={theme} height={30} />
        </div>
      </div>

      <p className="ac-text">{a.text}</p>

      <div className="ac-foot">
        <span className="ac-meta ac-type">
          {typeIcon(a.kind, { width: 14, height: 14 })}
          {isBatch
            ? <span>{a.variations} {a.variations === 1 ? "variação" : "variações"}</span>
            : <span className="mono">{a.dur}</span>}
        </span>
        <span style={{ flex: 1 }}></span>
        <span className="ac-date">{a.date}</span>
      </div>
    </div>
  );
}

/* ---- Table (datatable) view ---- */
export function AudioTable({ list, onOpen, onMore, sortKey, sortDir, onSort }: {
  list: LibraryAudio[]; onOpen?: (a: LibraryAudio) => void; onMore?: (a: LibraryAudio, rect: DOMRect) => void;
  sortKey: string; sortDir: "asc" | "desc"; onSort: (k: string) => void;
}) {
  const SortHead = ({ k, children, num }: { k: string; children: ReactNode; num?: boolean }) => (
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
            <th className="mt-th" style={{ width: 44 }}></th>
            <th className="mt-th">Modelo</th>
            <SortHead k="title">Título</SortHead>
            <th className="mt-th" style={{ width: 44 }}></th>
            <th className="mt-th num"></th>
            <th className="mt-th num">Trechos</th>
            <th className="mt-th num">Variações</th>
            <SortHead k="date">Data</SortHead>
            <th className="mt-th" style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.map((a, i) => {
            const isBatch = a.kind === "batch";
            return (
              <tr key={a.id} className="mt-row" style={{ animationDelay: (i * 0.022) + "s" }} onClick={() => onOpen && onOpen(a)}>
                <td className="mt-td mt-typecell" title={isBatch ? "Lote" : "Áudio único"}>
                  <span className="mt-typeic">{typeIcon(a.kind, { width: 17, height: 17 })}</span>
                </td>
                <td className="mt-td"><ModelTag id={a.model} sm /></td>
                <td className="mt-td mt-title">
                  <div className="mt-title-text">
                    <span className="mt-name">{a.name}</span>
                    {a.status === "rascunho" && <span className="mt-draft">Rascunho</span>}
                  </div>
                  <CampaignLabel name={a.campaign} />
                </td>
                <td className="mt-td"><button className="mt-play" onClick={(e) => { e.stopPropagation(); onOpen && onOpen(a); }}>{Icon.play({ style: { width: 13, height: 13 } })}</button></td>
                <td className="mt-td num mt-muted"><span className="mono">{a.dur}</span></td>
                <td className="mt-td num mt-muted">{a.trechos}</td>
                <td className="mt-td num mt-muted mt-dv">{isBatch ? a.variations : "—"}</td>
                <td className="mt-td mt-muted">{a.date}</td>
                <td className="mt-td"><button className="ac-more icon-btn" style={{ width: 30, height: 30, border: "none" }} onClick={(e) => { e.stopPropagation(); onMore && onMore(a, e.currentTarget.getBoundingClientRect()); }}>{Icon.more()}</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- View-preferences popover ---- */
export function ViewPrefs({ perPage, setPerPage, view, setView, onClose, showLayout = true, showModels = false, model, setModel, filters }: {
  perPage: number; setPerPage: (n: number) => void; view: string; setView: (v: string) => void; onClose: () => void;
  showLayout?: boolean; showModels?: boolean; model?: string; setModel?: (m: string) => void; filters?: { id: string; name: string }[];
}) {
  return (
    <>
      <div className="ss-pop-scrim" onClick={onClose}></div>
      <div className="vp-pop anim-up">
        <div className="ss-pop-title">Preferências de visualização</div>

        <div className="vp-row">
          <label className="vp-label">Exibir</label>
          <div className="vp-control">
            <select className="vp-select" value={perPage} onChange={(e) => setPerPage(+e.target.value)}>
              <option value={20}>20 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>
            <span className="vp-select-chev">{Icon.chevDown({ style: { width: 15, height: 15 } })}</span>
          </div>
        </div>

        {showLayout && (
          <div className="vp-row">
            <label className="vp-label">Layout</label>
            <div className="vp-seg">
              <button className={"vp-seg-btn" + (view === "grid" ? " active" : "")} onClick={() => setView("grid")}>
                {Icon.grid({ style: { width: 15, height: 15 } })} Grid de Cards
              </button>
              <button className={"vp-seg-btn" + (view === "table" ? " active" : "")} onClick={() => setView("table")}>
                {Icon.table({ style: { width: 15, height: 15 } })} Tabela
              </button>
            </div>
          </div>
        )}

        {showModels && filters && setModel && (
          <div className="vp-row">
            <label className="vp-label">Modelos</label>
            <div className="vp-models">
              {filters.map((f) => (
                <button key={f.id} className={"ma-chip" + (model === f.id ? " active" : "")}
                  onClick={() => setModel(f.id)}>
                  {f.id !== "all" && <span className="mdot" style={{ background: MODELS[f.id as ModelId]?.color }}></span>}
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

interface MenuPos { top: number; right: number }

/* ---- card / row "more" dropdown menu ---- */
export function MoreMenu({ pos, onClose, onDetails, onDuplicate, onDelete, onCampaign, hasCampaign }: {
  pos: MenuPos; onClose: () => void; onDetails: () => void; onDuplicate: () => void; onDelete: () => void;
  onCampaign: () => void; hasCampaign: boolean;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 59 }}></div>
      <div className="mm-menu anim-up" style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}>
        <button className="mm-item" onClick={onDetails}>{Icon.search({ style: { width: 15, height: 15 } })} Ver detalhes</button>
        <button className="mm-item" onClick={onCampaign}>{Icon.flag({ style: { width: 15, height: 15 } })} {hasCampaign ? "Editar Campanha" : "Adicionar Campanha"}</button>
        <button className="mm-item" onClick={onDuplicate}>{Icon.copy({ style: { width: 15, height: 15 } })} Duplicar</button>
        <div className="mm-sep"></div>
        <button className="mm-item danger" onClick={onDelete}>{Icon.trash({ style: { width: 15, height: 15 } })} Excluir</button>
      </div>
    </>
  );
}

/* ---- Dialog: atribuir/alterar Campanha de um audio ---- */
function CampaignAssignDialog({ audio, campaigns, onClose, onSave, onCreateCampaign }: {
  audio: LibraryAudio; campaigns: Campaign[]; onClose: () => void; onSave: (title: string) => void; onCreateCampaign?: () => void;
}) {
  const [sel, setSel] = useState(audio.campaign || "");
  return (
    <div className="md-scrim" onMouseDown={onClose}>
      <div className="md-box ca-box anim-pop" onMouseDown={(e) => e.stopPropagation()}>
        <div className="md-head">
          <div>
            <div className="u-label">{audio.name}</div>
            <h2 className="md-title" style={{ paddingTop: 8 }}>Editar Campanha</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>{Icon.close({ style: { width: 18, height: 18 } })}</button>
        </div>
        <div className="ca-field">
          <label className="ca-label">Campanha</label>
          <div className="vp-control">
            <select className="vp-select ca-select" value={sel} onChange={(e) => setSel(e.target.value)}>
              <option value="">Sem campanha</option>
              {(campaigns || []).map((c) => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
            </select>
            <span className="vp-select-chev">{Icon.chevDown({ style: { width: 15, height: 15 } })}</span>
          </div>
          <p className="ca-hint">Não encontrou a Campanha correta? <button className="ca-link" onClick={() => onCreateCampaign && onCreateCampaign()}>Criar campanha</button></p>
        </div>
        <div className="ca-foot">
          <button className="btn btn-ghost btn-lg" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-lg" onClick={() => onSave(sel)}>{Icon.check({ style: { width: 16, height: 16 } })} Salvar</button>
        </div>
      </div>
    </div>
  );
}

export interface MyAudiosProps {
  onNew?: () => void;
  onStartBatch?: () => void;
  onOpen?: (a: LibraryAudio) => void;
  theme?: string;
  filterCampaign?: string | null;
  embedded?: boolean;
  emptyState?: ReactNode;
  sectionTitle?: string;
  campaigns?: Campaign[];
  onCreateCampaign?: () => void;
}

export function MyAudios({ onNew, onStartBatch, onOpen, theme, filterCampaign = null, embedded = false, emptyState = null, sectionTitle, campaigns, onCreateCampaign }: MyAudiosProps) {
  const allCampaigns = campaigns || [];
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [model, setModel] = useState("all");
  const [view, setView] = useState("grid");
  const [perPage, setPerPage] = useState(20);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [items, setItems] = useState<LibraryAudio[]>(() => LIBRARY);
  const [menu, setMenu] = useState<{ a: LibraryAudio; top: number; right: number } | null>(null);
  const [assign, setAssign] = useState<LibraryAudio | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2400); };

  const openMenu = (a: LibraryAudio, rect: DOMRect) => setMenu({ a, top: rect.bottom + 6, right: Math.max(16, window.innerWidth - rect.right) });
  const doDetails = () => { const a = menu && menu.a; setMenu(null); a && onOpen && onOpen(a); };
  const doDuplicate = () => {
    const a = menu && menu.a; setMenu(null); if (!a) return;
    setItems((list) => { const i = list.findIndex((x) => x.id === a.id); const copy = { ...a, id: a.id + "-c" + Date.now(), name: a.name + " (cópia)" }; const nx = [...list]; nx.splice(i + 1, 0, copy); return nx; });
    flash("Áudio duplicado na biblioteca");
  };
  const doDelete = () => {
    const a = menu && menu.a; setMenu(null); if (!a) return;
    setItems((list) => list.filter((x) => x.id !== a.id)); flash("Áudio excluído");
  };
  const doCampaign = () => { const a = menu && menu.a; setMenu(null); if (a) setAssign(a); };
  const saveCampaign = (title: string) => {
    const a = assign; setAssign(null); if (!a) return;
    setItems((list) => list.map((x) => x.id === a.id ? { ...x, campaign: title || undefined } : x));
    flash(title ? "Campanha atualizada" : "Campanha removida");
  };

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((a) => {
      if (filterCampaign != null && (a.campaign || "") !== filterCampaign) return false;
      if (model !== "all" && a.model !== model) return false;
      if (!ql) return true;
      return a.name.toLowerCase().includes(ql)
        || (MODELS[a.model]?.name.toLowerCase().includes(ql))
        || a.text.toLowerCase().includes(ql)
        || (a.campaign || "").toLowerCase().includes(ql);
    });
  }, [q, model, items, filterCampaign]);

  const campaignCount = useMemo(() =>
    filterCampaign == null ? items.length : items.filter((a) => (a.campaign || "") === filterCampaign).length
    , [items, filterCampaign]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const r = sortKey === "title" ? a.name.localeCompare(b.name, "pt") : (a.ts - b.ts);
      return sortDir === "asc" ? r : -r;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const visible = useMemo(() => sorted.slice(0, perPage), [sorted, perPage]);

  const onSort = (k: string) => {
    if (sortKey === k) { setSortDir((d) => d === "asc" ? "desc" : "asc"); }
    else { setSortKey(k); setSortDir(k === "date" ? "desc" : "asc"); }
  };

  const filters = [{ id: "all", name: "Todos" }, { id: "spot", name: "Spot" }, { id: "carro", name: "Carro de Som" }];
  const effView = embedded ? "table" : view;

  const newBtn = (
    <div className="ma-new">
      <button className="btn btn-primary btn-lg" onClick={() => setNewOpen((o) => !o)}>
        {Icon.plus()} Novo
      </button>
      {newOpen && <>
        <div className="ma-new-scrim" onClick={() => setNewOpen(false)}></div>
        <div className="ma-new-menu anim-pop">
          <button className="ma-new-item" onClick={() => { setNewOpen(false); onNew && onNew(); }}>
            {Icon.waveform({ style: { width: 17, height: 17 } })} Áudio
          </button>
          <button className="ma-new-item" onClick={() => { setNewOpen(false); onStartBatch && onStartBatch(); }}>
            {Icon.layers({ style: { width: 17, height: 17 } })} Lote de Áudios
          </button>
        </div>
      </>}
    </div>
  );

  const toolbar = (
    <div className="ma-toolbar anim-up" style={{ animationDelay: ".05s" }}>
      <div className="ma-search">
        <span className="ma-search-ic">{Icon.search()}</span>
        <input className="field" style={{ paddingLeft: 42, height: 46 }}
          placeholder={embedded ? "Filtrar..." : "Filtrar por áudio, campanha ou texto do roteiro..."}
          value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button className="ma-clear" onClick={() => setQ("")}>{Icon.close()}</button>}
      </div>
      {!embedded && (
        <div className="ma-filters">
          {filters.map((f) => (
            <button key={f.id} className={"ma-chip" + (model === f.id ? " active" : "")}
              onClick={() => setModel(f.id)}>
              {f.id !== "all" && <span className="mdot" style={{ background: MODELS[f.id as ModelId]?.color }}></span>}
              {f.name}
            </button>
          ))}
        </div>
      )}
      <div className="ma-viewwrap">
        <button className={"ma-viewbtn" + (prefsOpen ? " active" : "")} onClick={() => setPrefsOpen((o) => !o)}
          title="Preferências de visualização">
          {Icon.sliders({ style: { width: 18, height: 18 } })}
        </button>
        {prefsOpen && (
          <ViewPrefs perPage={perPage} setPerPage={setPerPage}
            view={view} setView={setView} onClose={() => setPrefsOpen(false)}
            showLayout={!embedded} showModels={embedded}
            model={model} setModel={setModel} filters={filters} />
        )}
      </div>
    </div>
  );

  const viewwrap = (
    <div className="ma-viewwrap">
      <button className={"ma-viewbtn" + (prefsOpen ? " active" : "")} onClick={() => setPrefsOpen((o) => !o)}
        title="Preferências de visualização">
        {Icon.sliders({ style: { width: 18, height: 18 } })}
      </button>
      {prefsOpen && (
        <ViewPrefs perPage={perPage} setPerPage={setPerPage}
          view={view} setView={setView} onClose={() => setPrefsOpen(false)}
          showLayout={!embedded} showModels={embedded}
          model={model} setModel={setModel} filters={filters} />
      )}
    </div>
  );

  const embeddedToolbar = (
    <div className="ma-toolbar cd-toolbar anim-up" style={{ animationDelay: ".05s" }}>
      <div className="ma-search cd-search">
        <span className="ma-search-ic">{Icon.search()}</span>
        <input className="field" style={{ paddingLeft: 42, height: 46 }}
          placeholder="Filtrar..."
          value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button className="ma-clear" onClick={() => setQ("")}>{Icon.close()}</button>}
      </div>
      {viewwrap}
      <div className="cd-toolbar-spacer"></div>
      {newBtn}
    </div>
  );

  const results = (
    visible.length ? (
      effView === "table"
        ? <AudioTable list={visible} onOpen={onOpen} onMore={openMenu} sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        : <div className="ma-grid">
          {visible.map((a, i) => <AudioCard key={a.id} a={a} index={i} onOpen={onOpen} onMore={openMenu} theme={theme} />)}
        </div>
    ) : (
      <div className="ma-empty anim-in">
        <div className="ma-empty-ic">{Icon.search({ style: { width: 30, height: 30 } })}</div>
        <h3>Nenhum áudio encontrado</h3>
        <p>Tente outro termo ou limpe os filtros.</p>
        <button className="btn btn-ghost" onClick={() => { setQ(""); setModel("all"); }}>Limpar filtros</button>
      </div>
    )
  );

  const count = visible.length > 0 && (
    <div className="ma-count">{visible.length} de {sorted.length} {sorted.length === 1 ? "áudio" : "áudios"}</div>
  );

  const overlays = <>
    {menu && <MoreMenu pos={menu} onClose={() => setMenu(null)} onDetails={doDetails} onDuplicate={doDuplicate} onDelete={doDelete} onCampaign={doCampaign} hasCampaign={!!(menu.a && menu.a.campaign)} />}
    {assign && <CampaignAssignDialog audio={assign} campaigns={allCampaigns} onClose={() => setAssign(null)} onSave={saveCampaign} onCreateCampaign={() => { setAssign(null); onCreateCampaign && onCreateCampaign(); }} />}
    {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}
  </>;

  if (embedded) {
    return (
      <div className="cd-audios">
        <div className="cd-audios-label u-label anim-up">{sectionTitle || "Áudios da Campanha"}</div>
        {campaignCount === 0
          ? (emptyState || results)
          : <>{embeddedToolbar}{results}{count}</>}
        {overlays}
      </div>
    );
  }

  return (
    <div className="ma-page">
      <div className="diag-bg"></div>
      <div className="ma-inner">
        <div className="ma-head anim-up">
          <div>
            <div className="u-label" style={{ marginBottom: 10 }}>Biblioteca</div>
            <h1 className="display ma-title">Meus Áudios</h1>
            <p className="ma-sub">{items.length} áudios · gerados com vozes reais, prontos em segundos</p>
          </div>
          {newBtn}
        </div>
        {toolbar}
        {results}
        {count}
      </div>
      {overlays}
    </div>
  );
}
