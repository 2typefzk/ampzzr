/* ============================================================
   AMPLI — Tela "Chamados"  (CRUD de chamados de suporte)
   Mesmo look & feel de "Trilhas": datatable com ordenação.
   Cada linha é um chamado; ao clicar, abre a conversa no
   formato "Fuzzr Help" (ChamadoChat), onde é possível responder.
   O status é alterado pelo menu de cada linha.
   ============================================================ */
import { useMemo, useState, type ReactNode } from "react";
import { Icon } from "../components/Icon";
import { ChamadoChat } from "../components/Chamados";
import { CHAMADO_LIB, CHAMADO_STATUS, CAMPAIGNS } from "../data/mockData";
import type { Chamado, ChamadoMessage, ChamadoOption, ChamadoStatus } from "../types";

const STATUS_ORDER: Record<ChamadoStatus, number> = { aberto: 0, andamento: 1, resolvido: 2, fechado: 3 };

// Próximo número de protocolo a partir da lista atual (compartilhado com o
// fluxo "Preciso de ajuda" em App.tsx).
export function nextProtocolo(list: Chamado[]): string {
  const max = list.reduce((mx, c) => Math.max(mx, parseInt(c.protocolo.replace("#", ""), 10) || 0), 1820);
  return "#" + (max + 1);
}

/* ---- Status chip ---- */
export function StatusTag({ status, sm }: { status: ChamadoStatus; sm?: boolean }) {
  const s = CHAMADO_STATUS[status];
  return (
    <span className="ch-tag" style={{ height: sm ? 24 : 28, fontSize: sm ? 10.5 : 11.5, color: s.color, borderColor: s.color + "44", background: s.color + "1f" }}>
      <span className="ch-dot" style={{ background: s.color }}></span>{s.name}
    </span>
  );
}

/* ---- Table (datatable) view ---- */
export function ChamadoTable({ list, onOpen, onMore, sortKey, sortDir, onSort }: {
  list: Chamado[]; onOpen: (c: Chamado) => void; onMore: (c: Chamado, rect: DOMRect) => void;
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
            <SortHead k="subject">Assunto</SortHead>
            <SortHead k="status">Status</SortHead>
            <SortHead k="msgs" num>Mensagens</SortHead>
            <SortHead k="updated">Atualizado</SortHead>
            <th className="mt-th" style={{ width: 44 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.map((c, i) => {
            const unanswered = c.messages.length > 0 && c.messages[c.messages.length - 1].role === "cliente"
              && (c.status === "aberto" || c.status === "andamento");
            return (
              <tr key={c.id} className="mt-row" style={{ animationDelay: (i * 0.022) + "s" }}
                onClick={() => onOpen(c)}>
                <td className="mt-td mt-title">
                  <div className="mt-title-text">
                    <span className="ch-subj-ic">{Icon.chat({ style: { width: 16, height: 16 } })}</span>
                    <span className="mt-name">{c.subject}</span>
                    {unanswered && <span className="ch-badge" title="Aguardando resposta do suporte">Aguardando</span>}
                  </div>
                  <span className="ch-requester"><span className="mono ch-proto">{c.protocolo}</span> · {c.requester}{c.campaign ? " · " + c.campaign : ""}</span>
                </td>
                <td className="mt-td"><StatusTag status={c.status} sm /></td>
                <td className="mt-td num">
                  <span className="ch-msgcount">{Icon.chat({ style: { width: 13, height: 13 } })}{c.messages.length}</span>
                </td>
                <td className="mt-td mt-muted">{c.date}</td>
                <td className="mt-td">
                  <button className="ac-more icon-btn" style={{ width: 30, height: 30, border: "none" }}
                    onClick={(e) => { e.stopPropagation(); onMore(c, e.currentTarget.getBoundingClientRect()); }}>{Icon.more()}</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---- "more" dropdown ---- */
function ChamadoMenu({ pos, resolved, onClose, onOpen, onResolve, onReopen, onDelete }: {
  pos: { top: number; right: number }; resolved: boolean; onClose: () => void;
  onOpen: () => void; onResolve: () => void; onReopen: () => void; onDelete: () => void;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 59 }}></div>
      <div className="mm-menu anim-up" style={{ position: "fixed", top: pos.top, right: pos.right, zIndex: 60 }}>
        <button className="mm-item" onClick={onOpen}>{Icon.chat({ style: { width: 15, height: 15 } })} Abrir conversa</button>
        {resolved
          ? <button className="mm-item" onClick={onReopen}>{Icon.refresh({ style: { width: 15, height: 15 } })} Reabrir</button>
          : <button className="mm-item" onClick={onResolve}>{Icon.check({ style: { width: 15, height: 15 } })} Marcar como resolvido</button>}
        <div className="mm-sep"></div>
        <button className="mm-item danger" onClick={onDelete}>{Icon.trash({ style: { width: 15, height: 15 } })} Excluir</button>
      </div>
    </>
  );
}

/* ---- New chamado modal ---- */
function NewChamadoModal({ onClose, onCreate }: {
  onClose: () => void; onCreate: (v: { subject: string; campaign: string; body: string }) => void;
}) {
  const [subject, setSubject] = useState("");
  const [campaign, setCampaign] = useState("");
  const [body, setBody] = useState("");
  const ready = subject.trim().length > 0 && body.trim().length > 0;
  const submit = () => {
    if (!ready) return;
    onCreate({ subject: subject.trim(), campaign, body: body.trim() });
  };
  return (
    <div className="md-scrim anim-in" onClick={onClose}>
      <div className="md-box wide anim-up" onClick={(e) => e.stopPropagation()}>
        <div className="md-head">
          <div>
            <h3 className="md-title">Novo chamado</h3>
            <p className="md-sub">Descreva sua solicitação para a equipe Fuzzr.</p>
          </div>
          <button className="icon-btn" onClick={onClose}>{Icon.close()}</button>
        </div>
        <div className="md-body">
          <div className="tr-form-row">
            <label className="tr-form-label">Assunto</label>
            <input className="field" value={subject} autoFocus
              placeholder="Ex.: Ruído de fundo no spot renderizado"
              onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="tr-form-row">
            <label className="tr-form-label">Campanha <span className="ch-opt">(opcional)</span></label>
            <div className="vp-control">
              <select className="vp-select" value={campaign} onChange={(e) => setCampaign(e.target.value)}>
                <option value="">Sem campanha</option>
                {CAMPAIGNS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <span className="vp-select-chev">{Icon.chevDown({ style: { width: 15, height: 15 } })}</span>
            </div>
          </div>
          <div className="tr-form-row">
            <label className="tr-form-label">Mensagem</label>
            <textarea className="field ch-newmsg" rows={4} value={body}
              placeholder="Explique o que você precisa com o máximo de detalhes…"
              onChange={(e) => setBody(e.target.value)} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" disabled={!ready} onClick={submit}>{Icon.plus()} Abrir chamado</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
export interface ChamadosProps {
  items?: Chamado[];
  setItems?: React.Dispatch<React.SetStateAction<Chamado[]>>;
}

export function Chamados({ items: itemsProp, setItems: setItemsProp }: ChamadosProps) {
  const [localItems, setLocalItems] = useState<Chamado[]>(() => CHAMADO_LIB);
  const items = itemsProp || localItems;
  const setItems = setItemsProp || setLocalItems;
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ChamadoStatus>("all");
  const [sortKey, setSortKey] = useState("updated");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [menu, setMenu] = useState<{ c: Chamado; top: number; right: number } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const flash = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2600); };

  const open = items.find((c) => c.id === openId) || null;

  const patch = (id: string, fn: (c: Chamado) => Chamado) =>
    setItems((list) => list.map((c) => c.id === id ? fn(c) : c));

  const setStatus = (id: string, status: ChamadoStatus) => {
    patch(id, (c) => ({ ...c, status, updatedTs: Date.now(), date: "Agora" }));
    flash("Status atualizado para “" + CHAMADO_STATUS[status].name + "”");
  };

  const reply = (id: string, body: string) => {
    patch(id, (c) => {
      const msg: ChamadoMessage = {
        id: "m" + Date.now(), role: "cliente", author: c.requester, body, time: "Agora", ts: Date.now(),
      };
      const reopened = c.status === "resolvido" || c.status === "fechado";
      return {
        ...c, messages: [...c.messages, msg], updatedTs: Date.now(), date: "Agora",
        status: reopened ? "aberto" : c.status,
      };
    });
  };

  const choose = (id: string, msgId: string, option: ChamadoOption) => {
    patch(id, (c) => {
      const now = Date.now();
      const reply: ChamadoMessage[] = [
        { id: "u" + now, role: "cliente", author: c.requester, body: option.label, time: "Agora", ts: now },
        { id: "f" + now, role: "suporte", author: "Equipe Fuzzr", body: option.reply, time: "Agora", ts: now + 1 },
      ];
      const messages = c.messages
        .map((m) => m.id === msgId ? { ...m, options: undefined } : m)
        .concat(reply);
      return { ...c, messages, updatedTs: now, date: "Agora" };
    });
  };

  const createChamado = ({ subject, campaign, body }: {
    subject: string; campaign: string; body: string;
  }) => {
    const now = Date.now();
    const c: Chamado = {
      id: "ch" + now, protocolo: nextProtocolo(items), subject, status: "aberto",
      requester: "Luciana Zappala", campaign: campaign || undefined,
      createdTs: now, openedDate: "Hoje", updatedTs: now, date: "Agora",
      messages: [{ id: "m" + now, role: "cliente", author: "Luciana Zappala", body, time: "Agora", ts: now }],
    };
    setItems((list) => [c, ...list]);
    setSortKey("updated"); setSortDir("desc");
    setCreating(false);
    setOpenId(c.id);
    flash("Chamado " + c.protocolo + " aberto");
  };

  const openMenu = (c: Chamado, rect: DOMRect) => setMenu({ c, top: rect.bottom + 6, right: Math.max(16, window.innerWidth - rect.right) });
  const closeMenu = () => setMenu(null);
  const doOpen = () => { const c = menu && menu.c; closeMenu(); if (c) setOpenId(c.id); };
  const doResolve = () => { const c = menu && menu.c; closeMenu(); if (c) setStatus(c.id, "resolvido"); };
  const doReopen = () => { const c = menu && menu.c; closeMenu(); if (c) setStatus(c.id, "aberto"); };
  const doDelete = () => {
    const c = menu && menu.c; closeMenu(); if (!c) return;
    if (openId === c.id) setOpenId(null);
    setItems((list) => list.filter((x) => x.id !== c.id));
    flash("Chamado excluído");
  };

  const openCount = useMemo(() => items.filter((c) => c.status === "aberto" || c.status === "andamento").length, [items]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!ql) return true;
      return c.subject.toLowerCase().includes(ql)
        || c.protocolo.toLowerCase().includes(ql)
        || (c.campaign || "").toLowerCase().includes(ql)
        || c.messages.some((m) => m.body.toLowerCase().includes(ql));
    });
  }, [q, statusFilter, items]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let r: number;
      if (sortKey === "subject") r = a.subject.localeCompare(b.subject, "pt");
      else if (sortKey === "status") r = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      else if (sortKey === "msgs") r = a.messages.length - b.messages.length;
      else r = a.updatedTs - b.updatedTs;
      return sortDir === "asc" ? r : -r;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const onSort = (k: string) => {
    if (sortKey === k) { setSortDir((d) => d === "asc" ? "desc" : "asc"); }
    else { setSortKey(k); setSortDir(k === "subject" ? "asc" : "desc"); }
  };

  const statusChips: { id: "all" | ChamadoStatus; name: string }[] = [
    { id: "all", name: "Todos" },
    { id: "aberto", name: "Aberto" },
    { id: "andamento", name: "Em andamento" },
    { id: "resolvido", name: "Resolvido" },
    { id: "fechado", name: "Fechado" },
  ];

  return (
    <div className="ma-page">
      <div className="diag-bg"></div>
      <div className="ma-inner">
        <div className="ma-head anim-up">
          <div>
            <div className="u-label" style={{ marginBottom: 10 }}>Suporte</div>
            <h1 className="display ma-title">Chamados</h1>
            <p className="ma-sub">{items.length} chamados · {openCount} em aberto com a equipe Fuzzr</p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => setCreating(true)}>
            {Icon.plus()} Novo chamado
          </button>
        </div>

        <div className="ma-toolbar anim-up" style={{ animationDelay: ".05s" }}>
          <div className="ma-search">
            <span className="ma-search-ic">{Icon.search()}</span>
            <input className="field" style={{ paddingLeft: 42, height: 46 }}
              placeholder="Filtrar por assunto, protocolo ou mensagem…"
              value={q} onChange={(e) => setQ(e.target.value)} />
            {q && <button className="ma-clear" onClick={() => setQ("")}>{Icon.close()}</button>}
          </div>
          <div className="ma-filters">
            {statusChips.map((f) => (
              <button key={f.id} className={"ma-chip" + (statusFilter === f.id ? " active" : "")}
                onClick={() => setStatusFilter(f.id)}>
                {f.id !== "all" && <span className="mdot" style={{ background: CHAMADO_STATUS[f.id as ChamadoStatus].color }}></span>}
                {f.name}
              </button>
            ))}
          </div>
        </div>

        {sorted.length ? (
          <ChamadoTable list={sorted} onOpen={(c) => setOpenId(c.id)} onMore={openMenu}
            sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
        ) : (
          <div className="ma-empty anim-in">
            <div className="ma-empty-ic">{Icon.chat({ style: { width: 30, height: 30 } })}</div>
            <h3>{q || statusFilter !== "all" ? "Nenhum chamado encontrado" : "Nenhum chamado por aqui"}</h3>
            <p>{q || statusFilter !== "all" ? "Tente outro termo ou limpe os filtros." : "Precisa de ajuda? Abra um chamado para falar com a equipe Fuzzr."}</p>
            {q || statusFilter !== "all"
              ? <button className="btn btn-ghost" onClick={() => { setQ(""); setStatusFilter("all"); }}>Limpar filtros</button>
              : <button className="btn btn-primary" onClick={() => setCreating(true)}>{Icon.plus()} Novo chamado</button>}
          </div>
        )}

        {sorted.length > 0 && (
          <div className="ma-count">{sorted.length} de {items.length} {items.length === 1 ? "chamado" : "chamados"}</div>
        )}
      </div>

      {menu && <ChamadoMenu pos={menu} resolved={menu.c.status === "resolvido" || menu.c.status === "fechado"}
        onClose={closeMenu} onOpen={doOpen} onResolve={doResolve} onReopen={doReopen} onDelete={doDelete} />}
      {open && <ChamadoChat chamado={open} onClose={() => setOpenId(null)}
        onReply={(body) => reply(open.id, body)}
        onChoose={(msgId, option) => choose(open.id, msgId, option)} />}
      {creating && <NewChamadoModal onClose={() => setCreating(false)} onCreate={createChamado} />}
      {toast && <div className="sp-toast anim-up">{Icon.check({ style: { width: 16, height: 16 } })} {toast}</div>}
    </div>
  );
}
