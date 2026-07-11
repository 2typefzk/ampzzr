/* ============================================================
   AMPLI — Etapa II: Estrutura
   ============================================================ */
import { useState, useEffect, type ReactNode } from "react";
import { Icon } from "../../components/Icon";
import { Waveform } from "../../components/Waveform";
import { AmpliAudio, makeWaveBars } from "../../lib/audioEngine";
import { MODELS, TRILHAS, TRILHA_GENRES } from "../../data/mockData";
import { fmtDur as fmtTrilhaDur } from "../Trilhas";
import type { HelpTarget, ModelId, Trecho, TrechoTipo, Trilha } from "../../types";

/* Variações of a "Variável" trecho — always returns at least one block. */
export function getVars(t?: Trecho | null): string[] {
  if (t && t.variacoes && t.variacoes.length) return t.variacoes;
  return [t && t.content ? t.content : ""];
}
export function previewPlan(trechos: Trecho[]): { count: number; discrepant: boolean } {
  const counts = (trechos || []).filter((t) => t.tipo === "variavel").map((t) => getVars(t).length);
  if (!counts.length) return { count: 1, discrepant: false };
  const max = Math.max.apply(null, counts);
  const discrepant = counts.some((c) => c !== counts[0]);
  return { count: max, discrepant };
}

/* Shared full-script builder — also used by Etapa III (Prévia) read-only roteiro */
export function buildRoteiroText(trechos: Trecho[]): string {
  const parts = (trechos || []).map((t, i) => {
    const head = "## Trecho " + (i + 1) + " (" + (t.label || "") + ")";
    let body: string;
    if (t.tipo === "audio") {
      body = t.audio ? "[Áudio: " + t.audio.name + "]" : "[Áudio não carregado]";
    } else if (t.tipo === "variavel") {
      const vs = getVars(t);
      const lead = (vs[0] || "").trim() || "[Sem conteúdo]";
      const bullets = vs.map((v, vi) => "  • Variação " + (vi + 1) + ": " + ((v || "").trim() || "[vazio]")).join("\n");
      body = lead + "\n" + bullets;
    } else {
      body = (t.content || "").trim() || "[Sem conteúdo]";
    }
    return head + "\n" + body;
  });
  return parts.join("\n\n") + "\n\nFIM ROTEIRO";
}

/* Roteiro text for a single variation index */
export function buildRoteiroForVariation(trechos: Trecho[], vi: number): string {
  const parts = (trechos || []).map((t, i) => {
    const head = "## Trecho " + (i + 1) + " (" + (t.label || "") + ")";
    let body: string;
    if (t.tipo === "audio") {
      body = t.audio ? "[Áudio: " + t.audio.name + "]" : "[Áudio não carregado]";
    } else if (t.tipo === "variavel") {
      const vs = getVars(t);
      body = ((vs[vi] != null ? vs[vi] : vs[0]) || "").trim() || "[Sem conteúdo]";
    } else {
      body = (t.content || "").trim() || "[Sem conteúdo]";
    }
    return head + "\n" + body;
  });
  return parts.join("\n\n") + "\n\nFIM ROTEIRO";
}

function trMoodLabel(t?: Trilha | null) {
  if (!t) return "";
  if (t.mood) return t.mood;
  const g = TRILHA_GENRES[t.genre || "sem"];
  const base = g ? g.name : "Trilha";
  return base + (t.bpm ? " · " + t.bpm + " BPM" : "");
}
function trDurLabel(t?: Trilha | null) {
  if (!t) return "";
  if (t.dur) return t.dur;
  return fmtTrilhaDur(t.durSec);
}

export interface StepStructureProps {
  model: ModelId;
  setModel: (id: ModelId) => void;
  title: string;
  setTitle: (t: string) => void;
  trechos: Trecho[];
  setTrechos: React.Dispatch<React.SetStateAction<Trecho[]>>;
  selId: string | null;
  setSelId: (id: string) => void;
  trilha: Trilha | null;
  setTrilha: (t: Trilha | null) => void;
  trilhas: Trilha[];
  onGenerate: () => void;
  onClose: () => void;
  onBack: () => void;
  onRequestHelp?: (target: HelpTarget) => void;
  showQuality?: boolean;
  modelosEnabled?: boolean;
  varLabels: string[];
  setVarLabels: React.Dispatch<React.SetStateAction<string[]>>;
}

export function StepStructure(props: StepStructureProps) {
  const { model, setModel, title, setTitle, trechos, setTrechos,
    selId, setSelId, trilha, setTrilha, trilhas, onGenerate, onClose, onBack, onRequestHelp, showQuality, modelosEnabled,
    varLabels, setVarLabels } = props;
  const trilhaList = (trilhas && trilhas.length) ? trilhas : TRILHAS;

  const [editingTitle, setEditingTitle] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [trilhaOpen, setTrilhaOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [quality, setQuality] = useState(!!showQuality);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(model !== "spot");
  const [roteiroOpen, setRoteiroOpen] = useState(true);
  const [trilhaSecOpen, setTrilhaSecOpen] = useState(true);

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2600); };

  const buildRoteiro = () => buildRoteiroText(trechos);
  const copyRoteiro = () => {
    const txt = buildRoteiro();
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(done).catch(done);
    } else { done(); }
    flash("Roteiro copiado para a área de transferência");
  };

  const sel = trechos.find((t) => t.id === selId) || trechos[0];
  const m = MODELS[model];

  const updateTrecho = (id: string, patch: Partial<Trecho>) => setTrechos((ts) => ts.map((t) => t.id === id ? { ...t, ...patch } : t));

  const setTipo = (id: string, tipo: TrechoTipo) => {
    setTrechos((ts) => {
      let targetCount: number | null = null;
      if (tipo === "variavel") {
        const firstVar = ts.find((t) => t.id !== id && t.tipo === "variavel");
        if (firstVar) targetCount = getVars(firstVar).length;
      }
      return ts.map((t) => {
        if (t.id !== id) return t;
        if (tipo === "variavel") {
          let vars = t.variacoes && t.variacoes.length ? t.variacoes.slice() : [t.content || ""];
          if (targetCount != null) { while (vars.length < targetCount) vars.push(""); }
          return { ...t, tipo, variacoes: vars };
        }
        const patch: Trecho = { ...t, tipo };
        if (tipo === "texto" && !(t.content || "").trim() && t.variacoes && t.variacoes.length) {
          patch.content = t.variacoes[0];
        }
        return patch;
      });
    });
  };

  const addVar = (id: string) => setTrechos((ts) => ts.map((t) => t.id === id ? { ...t, variacoes: [...getVars(t), ""] } : t));
  const updateVar = (id: string, idx: number, val: string) => setTrechos((ts) => ts.map((t) => t.id === id ? { ...t, variacoes: getVars(t).map((v, i) => i === idx ? val : v) } : t));
  const delVar = (id: string, idx: number) => setTrechos((ts) => ts.map((t) => {
    if (t.id !== id) return t;
    const vs = getVars(t);
    if (vs.length <= 1) return t;
    return { ...t, variacoes: vs.filter((_, i) => i !== idx) };
  }));

  const varLabel = (i: number) => (varLabels && varLabels[i]) || ("Variação " + (i + 1));
  const renameVar = (i: number, val: string) => setVarLabels((arr) => { const nx = (arr || []).slice(); nx[i] = val; return nx; });
  const addTrecho = () => {
    const n = trechos.length + 1;
    const id = "t" + Date.now();
    setTrechos((ts) => [...ts, { id, label: "Trecho " + n, content: "" }]);
    setSelId(id);
  };
  const delTrecho = (id: string) => {
    if (trechos.length <= 1) return;
    setTrechos((ts) => {
      const nx = ts.filter((t) => t.id !== id);
      if (selId === id) setSelId(nx[0].id);
      return nx;
    });
  };

  const onDragStart = (e: React.DragEvent, id: string) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id === dragId) { setOverId(null); return; }
    setOverId(id);
  };
  const onDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!dragId || dragId === id) { setDragId(null); setOverId(null); return; }
    setTrechos((ts) => {
      const arr = [...ts];
      const from = arr.findIndex((t) => t.id === dragId);
      const to = arr.findIndex((t) => t.id === id);
      const [moved] = arr.splice(from, 1);
      arr.splice(to, 0, moved);
      return arr;
    });
    setDragId(null); setOverId(null);
  };

  const canGenerate = trechos.some((t) => t.tipo === "audio" ? !!t.audio : t.tipo === "variavel" ? getVars(t).some((v) => v.trim().length > 0) : (t.content || "").trim().length > 0);
  const plan = previewPlan(trechos);
  const genLabel = plan.discrepant ? "Gerar Prévias" : plan.count > 1 ? "Gerar Prévias (" + plan.count + ")" : "Gerar prévia";

  const footerBar =
    <div className="ss-footer">
      <div className="ss-footer-info">
        <span className="mono ss-footer-dur">~ {estimateDuration(trechos)}</span>
        <span className="ss-footer-sep">·</span>
        <span>{trechos.length} trechos</span>
        {trilha && <><span className="ss-footer-sep">·</span><span>trilha: {trilha.name}</span></>}
        <button className="btn btn-ghost btn-sm be-help-btn" onClick={() => onRequestHelp && onRequestHelp({ kind: "audio", title })}>
          {Icon.help({ style: { width: 16, height: 16 } })} Preciso de ajuda
        </button>
      </div>
      <div className="ss-footer-actions">
        {model === "novo" &&
          <button className="btn btn-ghost btn-lg" onClick={() => flash("Modelo salvo na sua biblioteca")}>
            {Icon.plus()} Salvar Modelo
          </button>
        }
        <div className="ss-gen-wrap">
          <button className="btn btn-primary btn-lg" disabled={!canGenerate || plan.discrepant} onClick={onGenerate}>
            {Icon.sparkle()} {genLabel}
          </button>
          {plan.discrepant &&
            <span className="ss-gen-tip">Não é possível gerar Prévias, pois a quantidade de variações é discrepante entre os trechos.</span>
          }
        </div>
      </div>
    </div>;

  return (
    <div className="ss-wrap">
      <header className="ss-header">
        <div className="ss-header-left">
          <button className="ss-step-back" onClick={onBack} title="Voltar">{Icon.chevLeft({ style: { width: 18, height: 18 } })}</button>
          <button className="ss-model-btn" onClick={() => setModelOpen((o) => !o)}>
            <span className="mdot" style={{ background: m.color }}></span>
            {m.name}
            <span className="ss-chev">{Icon.chevDown({ style: { width: 15, height: 15 } })}</span>
          </button>

          <div className="ss-title-wrap">
            {editingTitle ?
              <input autoFocus className="ss-title-input"
                value={title} onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => { if (e.key === "Enter") setEditingTitle(false); }} /> :

              <button className="ss-title" onClick={() => setEditingTitle(true)}>
                <span>{title || "Novo Áudio"}</span>
                <span className="ss-title-pencil">{Icon.pencil({ style: { width: 15, height: 15 } })}</span>
              </button>
            }
          </div>

          {modelOpen &&
            <>
              <div className="ss-pop-scrim" onClick={() => setModelOpen(false)}></div>
              <div className="ss-model-pop anim-up">
                <div className="ss-pop-title">Trocar modelo</div>
                {Object.values(MODELS).filter((mm) => modelosEnabled || mm.id !== "novo").map((mm) =>
                  <button key={mm.id} className={"ss-pop-item" + (mm.id === model ? " active" : "")}
                    onClick={() => { setModel(mm.id); setModelOpen(false); }}>
                    <span className="mdot" style={{ background: mm.color }}></span>
                    <div>
                      <div className="ss-pop-name">{mm.name}</div>
                      <div className="ss-pop-tag">{mm.tagline}</div>
                    </div>
                    {mm.id === model && <span className="ss-pop-check">{Icon.check({ style: { width: 16, height: 16 } })}</span>}
                  </button>
                )}
              </div>
            </>
          }
        </div>

        <div className="ss-header-right">
          <button className="btn btn-ghost" onClick={() => setImportOpen(true)}>
            {Icon.upload()} Importar
          </button>
          <button className="ss-close icon-btn" onClick={onClose}>{Icon.close()}</button>
        </div>
      </header>

      <div className="ss-body">
        <div className={"ss-cols" + (sidebarOpen ? "" : " sb-collapsed")}>
          <aside className={"ss-left" + (sidebarOpen ? "" : " collapsed")}>
            <div className="ss-block-head">
              <h2 className="ss-block-title">Estrutura</h2>
              <div className="ss-block-actions">
                <span className="tag orange"><span className="dot"></span>{trechos.length} {trechos.length === 1 ? "trecho" : "trechos"}</span>
                <button className="icon-btn accent" style={{ width: 30, height: 30 }} onClick={addTrecho} title="Adicionar trecho">{Icon.plus({ style: { width: 16, height: 16 } })}</button>
              </div>
            </div>

            <div className="ss-trechos">
              {trechos.map((t, i) => {
                const active = t.id === selId;
                const isDragging = dragId === t.id;
                const isOver = overId === t.id;
                return (
                  <div key={t.id}
                    className={"ss-trecho" + (active ? " active" : "") + (isDragging ? " dragging" : "") + (isOver ? " over" : "")}
                    draggable
                    onDragStart={(e) => onDragStart(e, t.id)}
                    onDragOver={(e) => onDragOver(e, t.id)}
                    onDrop={(e) => onDrop(e, t.id)}
                    onDragEnd={() => { setDragId(null); setOverId(null); }}
                    onClick={() => setSelId(t.id)}>
                    <span className="ss-trecho-drag">{Icon.drag({ style: { width: 18, height: 18 } })}</span>
                    <span className="ss-trecho-num mono">{String(i + 1).padStart(2, "0")}</span>
                    <div className="ss-trecho-body">
                      <div className="ss-trecho-label">{t.label}</div>
                      {t.tipo === "audio" ?
                        t.audio ?
                          <div className="ss-trecho-audio">
                            <span className="ss-trecho-audio-meta">{Icon.music({ style: { width: 12, height: 12 } })} Áudio ~ {fmtTrechoDur(t.audio.durSec)}</span>
                            <span className="ss-trecho-audio-file mono">{t.audio.name}</span>
                          </div> :

                          <div className="ss-trecho-snippet"><span className="ss-trecho-empty">Nenhum áudio carregado…</span></div> :

                        t.tipo === "variavel" ?
                          (() => {
                            const vs = getVars(t);
                            const extra = vs.length - 1;
                            return (
                              <>
                                <div className="ss-trecho-snippet">
                                  {vs[0].trim() ? vs[0] : <span className="ss-trecho-empty">Sem conteúdo ainda…</span>}
                                </div>
                                <span className="ss-trecho-varbadge">
                                  {Icon.layers ? Icon.layers({ style: { width: 12, height: 12 } }) : null}
                                  {extra > 0 ? "+" + extra + " " + (extra === 1 ? "variação" : "variações") : "Variável"}
                                </span>
                              </>);
                          })() :

                          <div className="ss-trecho-snippet">
                            {(t.content || "").trim() ? t.content : <span className="ss-trecho-empty">Sem conteúdo ainda…</span>}
                          </div>
                      }
                    </div>
                    <button className="ss-trecho-del" title="Remover"
                      onClick={(e) => { e.stopPropagation(); delTrecho(t.id); }}>
                      {Icon.trash({ style: { width: 15, height: 15 } })}
                    </button>
                  </div>);

              })}
            </div>
          </aside>

          <main className="ss-right">
            <div className="ss-content-head">
              <div className="ss-content-left">
                <button className="ss-collapse-btn" onClick={() => setSidebarOpen((o) => !o)}
                  title={sidebarOpen ? "Ocultar estrutura" : "Mostrar estrutura"}
                  aria-pressed={sidebarOpen}>
                  {sidebarOpen
                    ? Icon.panelLeftClose({ style: { width: 18, height: 18 } })
                    : Icon.panelLeftOpen({ style: { width: 18, height: 18 } })}
                </button>
                <div className="ss-content-meta">
                  <span className="u-label">Conteúdo do Trecho</span>
                  {editingLabel ?
                    <input autoFocus className="ss-content-label-input"
                      value={sel?.label || ""}
                      onChange={(e) => updateTrecho(sel.id, { label: e.target.value })}
                      onBlur={() => setEditingLabel(false)}
                      onKeyDown={(e) => { if (e.key === "Enter") setEditingLabel(false); }} /> :

                    <button className="ss-content-label-btn" onClick={() => setEditingLabel(true)} title="Renomear trecho">
                      <span className="ss-content-label">{sel?.label}</span>
                      <span className="ss-content-pencil">{Icon.pencil({ style: { width: 16, height: 16 } })}</span>
                    </button>
                  }
                </div>
              </div>
              <div className="ss-content-controls">
                <div className="ss-voice-pick">
                  <span className="ss-voice-lbl">Tipo</span>
                  <select className="ss-voice-sel"
                    value={sel?.tipo || "texto"}
                    onChange={(e) => setTipo(sel.id, e.target.value as TrechoTipo)}>
                    <option value="texto">Texto</option>
                    <option value="audio">Áudio</option>
                    <option value="variavel">Variável</option>
                  </select>
                </div>
              </div>
            </div>

            {sel?.tipo === "audio" ?
              <div className="ss-textarea-wrap">
                <AudioTrechoArea trecho={sel}
                  onSetAudio={(a) => updateTrecho(sel.id, { audio: a })}
                  onRemove={() => updateTrecho(sel.id, { audio: null })} />
                <div className="ss-textarea-foot">
                  <span className="ss-hint">{Icon.sparkle({ style: { width: 14, height: 14 } })} Carregue o áudio já gravado deste trecho</span>
                  {sel?.audio && <span className="ss-count mono">{sel.audio.name}</span>}
                </div>
              </div> :

              sel?.tipo === "variavel" ?
                <VariableTrechoArea trecho={sel}
                  labelFor={varLabel}
                  onRename={renameVar}
                  onAdd={() => addVar(sel.id)}
                  onUpdate={(idx, val) => updateVar(sel.id, idx, val)}
                  onRemove={(idx) => delVar(sel.id, idx)} /> :

                <div className="ss-textarea-wrap">
                  <textarea className="ss-textarea"
                    placeholder={"Digite ou cole o roteiro do trecho “" + (sel?.label || "") + "” aqui…"}
                    value={sel?.content || ""}
                    onChange={(e) => updateTrecho(sel.id, { content: e.target.value })} />
                  <div className="ss-textarea-foot">
                    <span className="ss-hint">{Icon.sparkle({ style: { width: 14, height: 14 } })} Navegue entre os trechos à esquerda para compor todo o áudio</span>
                    <span className="ss-count mono">{(sel?.content || "").length} car.</span>
                  </div>
                </div>
            }
          </main>

          <aside className="ss-roteiro" style={{ padding: "26px 28px" }}>
            <div className="ss-roteiro-head">
              <h2 className="ss-block-title">Roteiro</h2>
              <div className="ss-head-actions">
                <button className={"ss-roteiro-copy icon-only" + (copied ? " ok" : "")} onClick={copyRoteiro}>
                  {copied ?
                    Icon.check({ style: { width: 16, height: 16 } }) :
                    Icon.copy({ style: { width: 16, height: 16 } })}
                  <span className="ss-tip">{copied ? "Copiado!" : "Copiar roteiro"}</span>
                </button>
                <button className="ss-collapse-btn" onClick={() => setRoteiroOpen((o) => !o)}
                  title={roteiroOpen ? "Recolher roteiro" : "Expandir roteiro"}
                  aria-expanded={roteiroOpen}>
                  <span className={"ss-chev" + (roteiroOpen ? "" : " up")}>{Icon.chevDown({ style: { width: 18, height: 18 } })}</span>
                </button>
              </div>
            </div>
            {roteiroOpen && <>
              <div className="ss-roteiro-panel">
                <RoteiroReview trechos={trechos} labelFor={varLabel} />
              </div>
              <div className="ss-textarea-foot ss-roteiro-foot">
                <span className="ss-hint">{Icon.copy({ style: { width: 14, height: 14 } })} Pré-visualização somente leitura</span>
                <span className="ss-count mono">{buildRoteiro().length} car.</span>
              </div>
            </>}

            <div className="ss-sec-divider"></div>
            <div className="ss-roteiro-head">
              <h2 className="ss-block-title">Trilha de fundo</h2>
              <div className="ss-head-actions">
                <button className="ss-text-btn" onClick={() => setTrilhaOpen(true)}>
                  {trilha ? <>{Icon.pencil({ style: { width: 14, height: 14 } })} Editar</> :
                    <>{Icon.plus({ style: { width: 15, height: 15 } })} Adicionar</>}
                </button>
                <button className="ss-collapse-btn" onClick={() => setTrilhaSecOpen((o) => !o)}
                  title={trilhaSecOpen ? "Recolher trilha" : "Expandir trilha"}
                  aria-expanded={trilhaSecOpen}>
                  <span className={"ss-chev" + (trilhaSecOpen ? "" : " up")}>{Icon.chevDown({ style: { width: 18, height: 18 } })}</span>
                </button>
              </div>
            </div>
            {trilhaSecOpen && (trilha ?
              <div className="ss-trilha-card filled">
                <span className="ss-trilha-ic">{Icon.music({ style: { width: 18, height: 18 } })}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="ss-trilha-name">{trilha.name}</div>
                  <div className="ss-trilha-mood">{trMoodLabel(trilha)} · <span className="mono">{trDurLabel(trilha)}</span></div>
                </div>
                <button className="ss-trecho-del" onClick={() => setTrilha(null)} title="Remover trilha">{Icon.close({ style: { width: 15, height: 15 } })}</button>
              </div> :

              <button className="ss-trilha-card empty" onClick={() => setTrilhaOpen(true)}>
                <span className="ss-trilha-ic dim">{Icon.music({ style: { width: 18, height: 18 } })}</span>
                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div className="ss-trilha-name dim">Nenhuma trilha adicionada</div>
                  <div className="ss-trilha-mood">Adicionar trilha</div>
                </div>
                <span className="ss-trilha-plus">{Icon.plus({ style: { width: 16, height: 16 } })}</span>
              </button>)
            }
          </aside>
        </div>

        {footerBar}
      </div>

      {trilhaOpen &&
        <Modal onClose={() => setTrilhaOpen(false)} title="Trilha de fundo" sub="Escolha uma trilha para acompanhar a locução">
          <div className="tr-list">
            {trilhaList.map((t) =>
              <button key={t.id} className={"tr-item" + (trilha?.id === t.id ? " active" : "")}
                onClick={() => { setTrilha(t); setTrilhaOpen(false); }}>
                <span className="tr-ic">{Icon.music({ style: { width: 18, height: 18 } })}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="tr-name">{t.name}</div>
                  <div className="tr-mood">{trMoodLabel(t)}</div>
                </div>
                <span className="mono tr-dur">{trDurLabel(t)}</span>
                {trilha?.id === t.id && <span className="tr-check">{Icon.check({ style: { width: 16, height: 16 } })}</span>}
              </button>
            )}
          </div>
          {trilha && <button className="tr-remove" onClick={() => { setTrilha(null); setTrilhaOpen(false); }}>Remover trilha atual</button>}
        </Modal>
      }

      {importOpen && <ImportModal onClose={() => setImportOpen(false)} onImport={(parsed) => {
        setTrechos(parsed); setSelId(parsed[0].id); setImportOpen(false);
      }} />}

      {quality && <QualityDrawer onDismiss={() => setQuality(false)} onHelp={() => onRequestHelp && onRequestHelp({ kind: "audio", title })} />}

      {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}
    </div>);

}

/* bottom drawer to rate the imported / AI-processed roteiro */
function QualityDrawer({ onDismiss, onHelp }: { onDismiss: () => void; onHelp: () => void }) {
  const [phase, setPhase] = useState<"ask" | "up" | "down">("ask");
  const vote = (v: "up" | "down") => {
    setPhase(v);
    if (v === "up") setTimeout(onDismiss, 2100);
  };
  return (
    <div className="qd-wrap">
      <div className={"qd-card anim-up qd-" + phase}>
        <div className="qd-left">
          <span className="u-label">Qualidade do Roteiro</span>
          <p className="qd-msg">
            {phase === "ask" && "Como ficou o roteiro que geramos a partir do seu arquivo?"}
            {phase === "down" && "Que pena! Precisa de uma mão com o Roteiro?"}
            {phase === "up" && "Boa! Quando você estiver pronto, clique em Gerar Prévia."}
          </p>
        </div>
        <div className="qd-right">
          {phase === "down" &&
            <button className="btn btn-primary btn-sm qd-help" onClick={onHelp}>
              {Icon.help({ style: { width: 15, height: 15 } })} Preciso de ajuda
            </button>
          }
          <div className="qd-thumbs">
            <button className={"qd-thumb down" + (phase === "down" ? " active" : "")}
              onClick={() => vote("down")} title="Não gostei">
              {Icon.thumbsDown({ style: { width: 20, height: 20 } })}
            </button>
            <button className={"qd-thumb up" + (phase === "up" ? " active" : "")}
              onClick={() => vote("up")} title="Gostei">
              {Icon.thumbsUp({ style: { width: 20, height: 20 } })}
            </button>
          </div>
        </div>
      </div>
    </div>);

}

function fmtTrechoDur(t?: number) { t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ":" + String(s).padStart(2, "0"); }

export function estimateDuration(trechos: Trecho[]) {
  const words = trechos.reduce((s, t) => {
    const txt = t.tipo === "variavel" ? (getVars(t)[0] || "") : (t.content || "");
    return s + txt.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const secs = Math.max(5, Math.round(words / 2.6));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return mm + ":" + ss;
}

/* duration estimate for one variation index (variável trechos use that variation's text) */
export function estimateDurationForVariation(trechos: Trecho[], vi: number) {
  const words = trechos.reduce((s, t) => {
    const vs = getVars(t);
    const txt = t.tipo === "variavel" ? ((vs[vi] != null ? vs[vi] : vs[0]) || "") : (t.content || "");
    return s + txt.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
  const secs = Math.max(5, Math.round(words / 2.6));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0");
  const ss = String(secs % 60).padStart(2, "0");
  return mm + ":" + ss;
}

/* generic modal */
export function Modal({ title, sub, children, onClose, wide }: {
  title: string; sub?: string; children: ReactNode; onClose: () => void; wide?: boolean;
}) {
  return (
    <div className="md-scrim anim-in" onClick={onClose}>
      <div className={"md-box anim-up" + (wide ? " wide" : "")} onClick={(e) => e.stopPropagation()}>
        <div className="md-head">
          <div>
            <h3 className="md-title">{title}</h3>
            {sub && <p className="md-sub">{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose}>{Icon.close()}</button>
        </div>
        <div className="md-body">{children}</div>
      </div>
    </div>);

}

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (parsed: Trecho[]) => void }) {
  const [txt, setTxt] = useState("");
  const parse = () => {
    const blocks = txt.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    const src = blocks.length ? blocks : txt.split(/\n/).map((s) => s.trim()).filter(Boolean);
    const parsed: Trecho[] = (src.length ? src : [txt.trim() || "Trecho 1"]).map((c, i) => ({
      id: "t" + Date.now() + i, label: "Trecho " + (i + 1), content: c
    }));
    onImport(parsed);
  };
  return (
    <Modal onClose={onClose} title="Importar roteiro" sub="Cole o roteiro completo — cada parágrafo vira um trecho" wide>
      <textarea className="ss-textarea" style={{ minHeight: 200 }} autoFocus
        placeholder={"Cole aqui o roteiro…\n\nSepare os trechos com uma linha em branco."}
        value={txt} onChange={(e) => setTxt(e.target.value)} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
        <button className="btn btn-primary" disabled={!txt.trim()} onClick={parse}>{Icon.upload()} Importar trechos</button>
      </div>
    </Modal>);

}

/* ===== Audio upload area for a trecho (Tipo = Áudio) ===== */
export function AudioTrechoArea({ trecho, onSetAudio, onRemove }: {
  trecho: Trecho; onSetAudio: (a: NonNullable<Trecho["audio"]>) => void; onRemove: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [player, setPlayer] = useState<AmpliAudio | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const audio = trecho.audio;

  useEffect(() => {
    if (!audio) { setPlayer(null); return; }
    const p = new AmpliAudio(audio.durSec);
    const off = p.on((t, pl) => { setPlaying(pl); setCur(t); });
    let raf: number; const loop = () => { setCur(p.currentTime()); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    setPlayer(p);
    return () => { cancelAnimationFrame(raf); off(); p.destroy(); };
  }, [audio?.id]);

  const doUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      const seed = Math.floor(Math.random() * 900) + 10;
      onSetAudio({
        id: "au" + Date.now(),
        bars: makeWaveBars(120, seed),
        durSec: 14 + Math.floor(Math.random() * 22),
        name: "gravacao_" + (Math.floor(Math.random() * 900) + 100) + ".wav"
      });
    }, 1400);
  };

  const fmtT = (t?: number) => { t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ":" + String(s).padStart(2, "0"); };

  if (uploading) {
    return (
      <div className="au-area state">
        <div className="au-spinner"></div>
        <div className="au-state-txt">Processando áudio…</div>
      </div>);

  }
  if (!audio) {
    return (
      <button className="au-area empty" onClick={doUpload}>
        <span className="au-up-ic">{Icon.upload({ style: { width: 24, height: 24 } })}</span>
        <div className="au-up-title">Carregar áudio</div>
        <div className="au-up-hint">Arraste um arquivo ou clique para selecionar · MP3, WAV</div>
      </button>);

  }
  return (
    <div className="au-area filled">
      <div className="au-head">
        <span className="au-file-ic">{Icon.music({ style: { width: 16, height: 16 } })}</span>
        <span className="au-file-name">{audio.name}</span>
        <span className="au-file-dur mono">{fmtT(audio.durSec)}</span>
        <button className="au-remove" onClick={onRemove} title="Remover áudio">{Icon.trash({ style: { width: 15, height: 15 } })}</button>
      </div>
      <div className="au-player">
        <button className="au-play" onClick={() => player && player.toggle()}>
          {playing ? Icon.pause({ style: { width: 20, height: 20 } }) : Icon.play({ style: { width: 20, height: 20 } })}
        </button>
        <div className="au-wave">
          <Waveform player={player} bars={audio.bars || []} height={56} compact
            onScrub={(f) => player && player.seek(f)} />
        </div>
        <span className="au-time mono">{fmtT(cur)}</span>
      </div>
    </div>);

}

/* ===== Variable content area for a trecho (Tipo = Variável) ===== */
export function VariableTrechoArea({ trecho, labelFor, onRename, onAdd, onUpdate, onRemove }: {
  trecho: Trecho; labelFor?: (i: number) => string; onRename?: (i: number, v: string) => void;
  onAdd: () => void; onUpdate: (idx: number, val: string) => void; onRemove: (idx: number) => void;
}) {
  const vars = getVars(trecho);
  const [editIdx, setEditIdx] = useState(-1);
  const lbl = (i: number) => labelFor ? labelFor(i) : "Variação " + (i + 1);
  return (
    <div className="ss-var-wrap">
      <div className="ss-var-list">
        {vars.map((v, i) =>
          <div className="ss-var-block" key={i}>
            <div className="ss-var-head">
              <span className="ss-var-num mono">{String(i + 1).padStart(2, "0")}</span>
              {editIdx === i ?
                <input autoFocus className="ss-var-title-input"
                  value={lbl(i)}
                  onChange={(e) => onRename && onRename(i, e.target.value)}
                  onBlur={() => setEditIdx(-1)}
                  onKeyDown={(e) => { if (e.key === "Enter") setEditIdx(-1); }} /> :
                <button className="ss-var-title-btn" onClick={() => setEditIdx(i)} title="Renomear variação">
                  <span className="ss-var-title">{lbl(i)}</span>
                  <span className="ss-var-pencil">{Icon.pencil({ style: { width: 13, height: 13 } })}</span>
                </button>}
              {i === 0 && <span className="ss-var-tag">{Icon.layers({ style: { width: 11, height: 11 } })} Exibida na estrutura</span>}
              <button className="ss-var-del" title="Remover variação"
                disabled={vars.length <= 1}
                onClick={() => onRemove(i)}>{Icon.trash({ style: { width: 15, height: 15 } })}</button>
            </div>
            <textarea className="ss-var-textarea"
              placeholder={"Conteúdo de “" + lbl(i) + "”…"}
              value={v}
              onChange={(e) => onUpdate(i, e.target.value)} />
          </div>
        )}
        <button className="ss-var-add" onClick={onAdd}>
          {Icon.plus({ style: { width: 16, height: 16 } })} Adicionar variação
        </button>
      </div>
      <div className="ss-textarea-foot">
        <span className="ss-hint">{Icon.layers({ style: { width: 14, height: 14 } })} Cada variação gera uma prévia diferente deste áudio</span>
        <span className="ss-count mono">{vars.length} {vars.length === 1 ? "variação" : "variações"}</span>
      </div>
    </div>);

}

/* ===== Read-only roteiro review (right column) ===== */
export function RoteiroReview({ trechos, labelFor }: { trechos: Trecho[]; labelFor?: (i: number) => string }) {
  return (
    <div className="ss-roteiro-text">
      {(trechos || []).map((t, i) =>
        <div className="rr-block" key={t.id || i}>
          <div className="rr-head">## Trecho {i + 1} ({t.label || ""})</div>
          {t.tipo === "variavel" ?
            <VarRoteiroItem trecho={t} labelFor={labelFor} /> :
            <div className="rr-body">{
              t.tipo === "audio" ?
                t.audio ? "[Áudio: " + t.audio.name + "]" : "[Áudio não carregado]" :
                (t.content || "").trim() || "[Sem conteúdo]"
            }</div>}
        </div>
      )}
      <div className="rr-end">FIM ROTEIRO</div>
    </div>);

}

function VarRoteiroItem({ trecho, labelFor }: { trecho: Trecho; labelFor?: (i: number) => string }) {
  const [open, setOpen] = useState(true);
  const vs = getVars(trecho);
  const lead = (vs[0] || "").trim() || "[Sem conteúdo]";
  const lbl = (i: number) => labelFor ? labelFor(i) : "Variação " + (i + 1);
  return (
    <div className="rr-var">
      <div className="rr-body">{lead}</div>
      <button className="rr-var-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={"ss-chev" + (open ? "" : " up")}>{Icon.chevDown({ style: { width: 14, height: 14 } })}</span>
        {vs.length} {vs.length === 1 ? "variação" : "variações"}
      </button>
      {open &&
        <ul className="rr-var-list">
          {vs.map((v, i) =>
            <li className="rr-var-item" key={i}>
              <span className="rr-var-bullet">{lbl(i)}</span>
              <span className="rr-var-txt">{(v || "").trim() || "[vazio]"}</span>
            </li>
          )}
        </ul>}
    </div>);

}
