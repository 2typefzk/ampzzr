/* ============================================================
   AMPLI — Campanhas
   Entidade que agrupa Áudios, Lotes de Áudios e Trilhas.
   Exporta: Campaigns (lista), CampaignModal (criar/editar),
            CampaignDetail (detalhe).
   ============================================================ */
import { useState } from "react";
import { Icon } from "../components/Icon";
import { MyAudios } from "./MyAudios";
import { LIBRARY, TRILHA_LIB } from "../data/mockData";
import type { Campaign, LibraryAudio } from "../types";

/* ---- date helpers (ISO <-> DD/MM/AAAA) ---- */
function brFromIso(iso?: string) { if (!iso) return ""; const p = iso.split("-"); if (p.length !== 3) return ""; return p[2] + "/" + p[1] + "/" + p[0]; }
function isoFromBr(br?: string) { const m = (br || "").trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/); return m ? (m[3] + "-" + m[2] + "-" + m[1]) : ""; }
function maskDate(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "/" + d.slice(2, 4);
  if (d.length > 4) out += "/" + d.slice(4, 8);
  return out;
}
function vigenciaLabel(c: Campaign) {
  const s = brFromIso(c.start), e = brFromIso(c.end);
  if (s && e) return s + " — " + e;
  if (s) return "A partir de " + s;
  if (e) return "Até " + e;
  return "Sem vigência definida";
}
function campaignPieces(title: string): LibraryAudio[] {
  return LIBRARY.filter((a) => (a.campaign || "") === title);
}
function campaignTrilhas(title: string) {
  return TRILHA_LIB.filter((t) => (t.campaign || "") === title);
}

/* ============================================================
   Modal de criação / edição
   ============================================================ */
export function CampaignModal({ campaign, onClose, onSave }: {
  campaign: Campaign | null; onClose: () => void; onSave: (c: Campaign) => void;
}) {
  const editing = !!campaign;
  const [title, setTitle] = useState(campaign ? campaign.title : "");
  const [start, setStart] = useState(campaign ? brFromIso(campaign.start) : "");
  const [end, setEnd] = useState(campaign ? brFromIso(campaign.end) : "");
  const [desc, setDesc] = useState(campaign ? campaign.desc : "");
  const valid = title.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    onSave({
      id: campaign ? campaign.id : "cmp" + Date.now(),
      title: title.trim(),
      start: isoFromBr(start),
      end: isoFromBr(end),
      desc: desc.trim(),
      ts: campaign ? campaign.ts : Date.now(),
    });
  };

  return (
    <div className="md-scrim" onMouseDown={onClose}>
      <div className="md-box cm-box anim-pop" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cm-head">
          <div>
            <div className="u-label">{editing ? "Editar campanha" : "Nova campanha"}</div>
            <h2 className="cm-title">{editing ? "Editar Campanha" : "Criar Campanha"}</h2>
          </div>
          <button className="icon-btn cm-x" onClick={onClose}>{Icon.close({ style: { width: 18, height: 18 } })}</button>
        </div>

        <div className="cm-body">
          <div className="cm-field">
            <label className="cm-flabel">Título da Campanha <span className="cm-req">*</span></label>
            <p className="cm-help">Qual o Título da sua Campanha?</p>
            <input className="field cm-input" autoFocus value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Semana do Cliente"
              onKeyDown={(e) => { if (e.key === "Enter" && valid) submit(); }} />
          </div>

          <div className="cm-field">
            <label className="cm-flabel">Vigência</label>
            <p className="cm-help">Quando começa e quando termina a sua campanha?</p>
            <div className="cm-viggrid">
              <div className="cm-vigcol">
                <span className="cm-vigcap">De</span>
                <input className="field cm-input mono" inputMode="numeric" value={start}
                  onChange={(e) => setStart(maskDate(e.target.value))} placeholder="DD/MM/AAAA" />
              </div>
              <span className="cm-vigdash">—</span>
              <div className="cm-vigcol">
                <span className="cm-vigcap">Até</span>
                <input className="field cm-input mono" inputMode="numeric" value={end}
                  onChange={(e) => setEnd(maskDate(e.target.value))} placeholder="DD/MM/AAAA" />
              </div>
            </div>
          </div>

          <div className="cm-field">
            <label className="cm-flabel" style={{ paddingBottom: 8 }}>Descrição</label>
            <textarea className="field cm-textarea" value={desc} rows={4}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Resumo/direcional da campanha" />
          </div>
        </div>

        <div className="cm-foot">
          <button className="btn btn-ghost btn-lg" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-lg" disabled={!valid} onClick={submit}>
            {Icon.check({ style: { width: 16, height: 16 } })} {editing ? "Salvar alterações" : "Criar Campanha"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Empty state (dentro do detalhe) com dropdown "+ criar"
   ============================================================ */
export function CampaignEmptyAudios({ onNew, onStartBatch }: { onNew?: () => void; onStartBatch?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ma-empty cd-empty anim-in">
      <div className="ma-empty-ic">{Icon.waveform({ style: { width: 30, height: 30 } })}</div>
      <h3>Nenhum áudio nesta campanha</h3>
      <p>Você ainda não criou nem associou nenhum áudio a esta campanha.</p>
      <div className="ma-new cd-empty-new">
        <button className="btn btn-primary btn-lg" onClick={() => setOpen((o) => !o)}>
          {Icon.plus()} Criar o primeiro Áudio desta campanha
        </button>
        {open && <>
          <div className="ma-new-scrim" onClick={() => setOpen(false)}></div>
          <div className="ma-new-menu ma-new-menu--center anim-pop">
            <button className="ma-new-item" onClick={() => { setOpen(false); onNew && onNew(); }}>
              {Icon.waveform({ style: { width: 17, height: 17 } })} Áudio
            </button>
            <button className="ma-new-item" onClick={() => { setOpen(false); onStartBatch && onStartBatch(); }}>
              {Icon.layers({ style: { width: 17, height: 17 } })} Lote de Áudios
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

/* ============================================================
   Detalhe da Campanha
   ============================================================ */
export function CampaignDetail({ campaign, onBack, onEdit, onNew, onStartBatch, onOpen, theme, campaigns, onCreateCampaign }: {
  campaign: Campaign | null; onBack: () => void; onEdit: (c: Campaign) => void; onNew?: () => void;
  onStartBatch?: () => void; onOpen?: (a: LibraryAudio) => void; theme?: string; campaigns?: Campaign[]; onCreateCampaign?: () => void;
}) {
  if (!campaign) return null;
  const pieces = campaignPieces(campaign.title);
  const trilhas = campaignTrilhas(campaign.title);

  return (
    <div className="ma-page">
      <div className="diag-bg"></div>
      <div className="ma-inner">
        <button className="cd-back anim-up" onClick={onBack}>
          {Icon.chevLeft({ style: { width: 16, height: 16 } })} Voltar para Campanhas
        </button>

        <div className="cd-header anim-up" style={{ animationDelay: ".03s" }}>
          <div className="cd-header-main">
            <div className="u-label" style={{ marginBottom: 10 }}>Detalhe da Campanha</div>
            <h1 className="display ma-title">{campaign.title}</h1>
            {campaign.desc
              ? <p className="cd-desc">{campaign.desc}</p>
              : <p className="cd-desc cd-desc-empty">Sem descrição.</p>}
            <div className="cd-metrics">
              <div className="cd-metric">
                <span className="cd-metric-cap">Vigência</span>
                <span className="cd-metric-val">{vigenciaLabel(campaign)}</span>
              </div>
              <div className="cd-metric">
                <span className="cd-metric-cap">Peças</span>
                <span className="cd-metric-val">{pieces.length}</span>
              </div>
              <div className="cd-metric">
                <span className="cd-metric-cap">Trilhas</span>
                <span className="cd-metric-val">{trilhas.length}</span>
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-lg cd-edit" onClick={() => onEdit && onEdit(campaign)}>
            {Icon.pencil({ style: { width: 16, height: 16 } })} Editar
          </button>
        </div>

        <MyAudios
          embedded
          filterCampaign={campaign.title}
          sectionTitle="Áudios da Campanha"
          campaigns={campaigns}
          onCreateCampaign={onCreateCampaign}
          onNew={onNew}
          onStartBatch={onStartBatch}
          onOpen={onOpen}
          theme={theme}
          emptyState={<CampaignEmptyAudios onNew={onNew} onStartBatch={onStartBatch} />}
        />
      </div>
    </div>
  );
}

/* ============================================================
   Lista de Campanhas
   ============================================================ */
function CampaignCard({ c, index, onOpen }: { c: Campaign; index: number; onOpen: (c: Campaign) => void }) {
  const pieces = campaignPieces(c.title);
  const trilhas = campaignTrilhas(c.title);
  return (
    <div className="cl-card anim-up" style={{ animationDelay: (index * 0.035) + "s" }} onClick={() => onOpen && onOpen(c)}>
      <div className="cl-card-top">
        <span className="cl-flag">{Icon.flag({ style: { width: 16, height: 16 } })}</span>
        <span className="cl-vig mono">{vigenciaLabel(c)}</span>
      </div>
      <h3 className="cl-name">{c.title}</h3>
      <p className="cl-desc">{c.desc || "Sem descrição."}</p>
      <div className="cl-foot">
        <span className="cl-meta">{Icon.waveform({ style: { width: 14, height: 14 } })} {pieces.length} {pieces.length === 1 ? "peça" : "peças"}</span>
        <span className="cl-dot">·</span>
        <span className="cl-meta">{Icon.music({ style: { width: 14, height: 14 } })} {trilhas.length} {trilhas.length === 1 ? "trilha" : "trilhas"}</span>
      </div>
    </div>
  );
}

export function Campaigns({ campaigns, onOpen, onCreate }: {
  campaigns: Campaign[]; onOpen: (c: Campaign) => void; onCreate: () => void;
}) {
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const list = (campaigns || []).filter((c) => !ql || c.title.toLowerCase().includes(ql) || (c.desc || "").toLowerCase().includes(ql));

  return (
    <div className="ma-page">
      <div className="diag-bg"></div>
      <div className="ma-inner">
        <div className="ma-head anim-up">
          <div>
            <div className="u-label" style={{ marginBottom: 10 }}>Organização</div>
            <h1 className="display ma-title">Campanhas</h1>
            <p className="ma-sub">{(campaigns || []).length} {(campaigns || []).length === 1 ? "campanha" : "campanhas"} · agrupe áudios, lotes e trilhas</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={onCreate}>
            {Icon.plus()} Nova Campanha
          </button>
        </div>

        <div className="ma-toolbar anim-up" style={{ animationDelay: ".05s" }}>
          <div className="ma-search">
            <span className="ma-search-ic">{Icon.search()}</span>
            <input className="field" style={{ paddingLeft: 42, height: 46 }}
              placeholder="Filtrar por campanha, áudio ou direcional..." value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button className="ma-clear" onClick={() => setQ("")}>{Icon.close()}</button>}
          </div>
        </div>

        {list.length ? (
          <div className="cl-grid">
            {list.map((c, i) => <CampaignCard key={c.id} c={c} index={i} onOpen={onOpen} />)}
          </div>
        ) : (
          <div className="ma-empty anim-in">
            <div className="ma-empty-ic">{Icon.flag({ style: { width: 30, height: 30 } })}</div>
            <h3>Nenhuma campanha</h3>
            <p>Crie sua primeira campanha para agrupar materiais.</p>
            <button className="btn btn-primary" onClick={onCreate}>{Icon.plus()} Nova Campanha</button>
          </div>
        )}
      </div>
    </div>
  );
}
